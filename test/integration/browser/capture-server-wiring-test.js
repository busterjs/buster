(function (B) {
    if (typeof require == "function" && typeof module == "object") {
        return;
    }

    function setUp() {
        this.emitter = createRemoteEmitter();
        this.readyListener = sinon.spy();
        this.emitter.on("ready", this.readyListener);
        B.configureTestClient(this.emitter);

        this.bnt = B.nextTick;
        sinon.spy(B.testRunner, "runSuite");

        B.nextTick = function (callback) {
            callback();
        };
    }

    function tearDown() {
        B.nextTick = this.bnt;
        B.testRunner.runSuite.restore();
    }

    B.testCase("BrowserWiringTest", {
        setUp: setUp,
        tearDown: tearDown,

        "//should connect bayeux emitter": function () {
            B.referee.assert(this.emitter.connect.calledOnce);
        },

        "should not emit ready immediately": function () {
            B.referee.refute(this.readyListener.called);
        },

        "//should not emit ready when connected": function () {
            this.emitter.connect.args[0][0]();

            B.referee.refute(this.readyListener.calledOnce);
        },

        "//should emit ready when calling buster.ready": function () {
            this.emitter.connect.args[0][0]();
            B.ready();

            B.referee.assert(this.readyListener.calledOnce);
        },

        "//should not emit ready before client is connected": function () {
            B.ready();

            B.referee.refute(this.readyListener.calledOnce);
        },

        "//should emit ready when connected after calling buster.ready": function () {
            B.ready();
            this.emitter.connect.args[0][0]();

            B.referee.assert(this.readyListener.calledOnce);
        },

        "//should emit user agent string with ready event": function () {
            this.emitter.connect.args[0][0]();
            B.ready();

            B.referee.assert(/Mozilla/.test(this.readyListener.args[0][0].data));
        },

        "should set up console and buster.log shortcut": function () {
            B.referee.assert.isObject(B.console);
            B.referee.assert.isFunction(B.log);
        },

        "should format log messages nicely": function () {
            var message;
            B.console.on("log", function (msg) { message = msg.message });
            B.console.log("Hello world", { id: 42 });

            B.referee.assert.equals("Hello world { id: 42 }", message);
        },

        "should log messages through buster.log": function () {
            var message;
            B.console.on("log", function (msg) { message = msg.message });
            B.log("Hello world", { id: 42 });

            B.assert.equals(message, "Hello world { id: 42 }");
        },

        "//should send log messages over the wire": function () {
            var listener = sinon.spy();
            this.emitter.on("log", listener);

            B.console.warn("Hello world", { id: 42 });
            B.referee.assert(listener.calledOnce);

            var msg = listener.args[0][0];
            B.referee.assert.equals("log", msg.topic);

            B.referee.assert.equals({
                message: "Hello world { id: 42 }",
                level: "warn"
            }, msg.data);
        },

        "//should start running tests when emitting tests:run": function () {
            var listener = sinon.spy();
            this.emitter.on("suite:start", listener);

            B.testCase("SomeTest", { "should do it": function () {} });
            this.emitter.emit("tests:run", { autoRun: true });

            B.referee.assert(listener.calledOnce);
        },

        "//should run specs when emitting tests:run": function () {
            var listener = sinon.spy();
            this.emitter.on("context:start", listener);

            B.spec.describe("Spec", function () {
                B.spec.it("does it", function () {});
            });

            this.emitter.emit("tests:run", { autoRun: true });

            B.referee.assert(listener.calledOnce);
            B.referee.assert.equals(listener.args[0][0].data.name, "Spec");
        },

        "//should run parsable context when emitting tests:run": function () {
            var context = { name: "Parsed", tests: [{ name: "Yay" }], contexts: [] };

            B.addTestContext({
                parse: function () {
                    return context;
                }
            });

            this.emitter.emit("tests:run", { autoRun: true });

            B.referee.assert(B.testRunner.runSuite.calledOnce);
            B.referee.assert.equals(B.testRunner.runSuite.args[0][0], [context]);
        },

        "//should create test runner with options": function () {
            this.emitter.emit("tests:run", {
                timeout: 25
            });

            B.referee.assert.equals(25, B.wiredRunner.timeout);
        },

        "should configure assertions to throw": function () {
            this.emitter.emit("tests:run");
            B.referee.assert(B.assertions.throwOnFailure);
        },

        "//should count assertions": function () {
            var counts = [];

            B.testCase("AssertionCountTest", {
                tearDown: function () {
                    counts.push(B.wiredRunner.assertionCount());
                },

                "test #1": function () {
                    B.referee.assert(true);
                },

                "test #2": function () {
                    B.referee.assert(true);
                    B.referee.assert(true);
                }
            });

            this.emitter.emit("tests:run");

            B.referee.assert.equals(counts.sort(), [1, 2]);
        },

        "//should filter contexts prior to running": function () {
            var tests = [this.spy(), this.spy()];
            B.testCase("AssertionCountTest", {
                "test #1": tests[0],
                "test #2": tests[1]
            });

            this.emitter.emit("tests:run", { autoRun: true, filters: ["#1"] });

            B.referee.assert(tests[0].calledOnce);
            B.referee.refute(tests[1].called);
        },

        "//should capture console": function () {
            this.stub(B, "captureConsole");
            this.emitter.emit("tests:run", { captureConsole: true });
            B.referee.assert(B.captureConsole.calledOnce);
        },

        "should not always capture console": function () {
            this.stub(B, "captureConsole");
            this.emitter.emit("tests:run", { captureConsole: false });
            B.referee.assert(!B.captureConsole.called);
        }
    });

    B.testCase("BrowserWiringAutoRunFalseTest", {
        setUp: function () {
            setUp.call(this);

            this.listener = sinon.spy();
            this.emitter.on("suite:start", this.listener);
            B.testCase("SomeTest", { "should do it": function () {} });
        },

        tearDown: tearDown,

        "should not start running tests on tests:run when autoRun is false":
        function () {
            this.emitter.emit("tests:run", { autoRun: false });

            B.referee.refute(this.listener.calledOnce);
        },

        "//should start running tests when calling run after tests:run": function () {
            this.emitter.emit("tests:run", { autoRun: false });
            B.run();

            B.referee.assert(this.listener.calledOnce);
        },

        "//should start running tests when calling run before tests:run": function () {
            B.run();
            this.emitter.emit("tests:run", { autoRun: false });

            B.referee.assert(this.listener.calledOnce);
        },

        "should remove all script tags": function () {
            B.run();
            this.emitter.emit("tests:run", { autoRun: false });

            B.referee.assert.equals(0, document.body.getElementsByTagName("script").length);
        }
    });
}(buster));
