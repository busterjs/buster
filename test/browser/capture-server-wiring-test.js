(function (B) {
    if (typeof require == "function" && typeof module == "object") {
        return;
    }

    function setUp() {
        this.emitter = createRemoteEmitter();
        this.readyListener = sinon.spy();
        this.emitter.on("ready", this.readyListener);
        B.configureTestClient(this.emitter);

        this.bnt = buster.nextTick;
        sinon.spy(buster.testRunner, "runSuite");

        buster.nextTick = function (callback) {
            callback();
        };
    }

    function tearDown() {
        buster.nextTick = this.bnt;
        buster.testRunner.runSuite.restore();
    }

    buster.util.testCase("BrowserWiringTest", {
        setUp: setUp,
        tearDown: tearDown,

        "should connect bayeux emitter": function () {
            assertTrue(this.emitter.connect.calledOnce);
        },

        "should not emit ready immediately": function () {
            assertFalse(this.readyListener.called);
        },

        "should not emit ready when connected": function () {
            this.emitter.connect.args[0][0]();

            assertFalse(this.readyListener.calledOnce);
        },

        "should emit ready when calling buster.ready": function () {
            this.emitter.connect.args[0][0]();
            buster.ready();

            assertTrue(this.readyListener.calledOnce);
        },

        "should not emit ready before client is connected": function () {
            buster.ready();

            assertFalse(this.readyListener.calledOnce);
        },

        "should emit ready when connected after calling buster.ready": function () {
            buster.ready();
            this.emitter.connect.args[0][0]();

            assertTrue(this.readyListener.calledOnce);
        },

        "should emit user agent string with ready event": function () {
            this.emitter.connect.args[0][0]();
            buster.ready();

            assertTrue(/Mozilla/.test(this.readyListener.args[0][0].data));
        },

        "should set up console and buster.log shortcut": function () {
            assertObject(buster.console);
            assertFunction(buster.log);
        },

        "should format log messages nicely": function () {
            var message;
            buster.console.on("log", function (msg) { message = msg.message });
            buster.console.log("Hello world", { id: 42 });

            assertEquals("Hello world { id: 42 }", message);
        },

        "should log messages through buster.log": function () {
            var message;
            buster.console.on("log", function (msg) { message = msg.message });
            buster.log("Hello world", { id: 42 });

            buster.assert.equals(message, "Hello world { id: 42 }");
        },

        "should send log messages over the wire": function () {
            var listener = sinon.spy();
            this.emitter.on("log", listener);

            buster.console.warn("Hello world", { id: 42 });
            assertTrue(listener.calledOnce);

            var msg = listener.args[0][0];
            assertEquals("log", msg.topic);

            assertEquals({
                message: "Hello world { id: 42 }",
                level: "warn"
            }, msg.data);
        },

        "should start running tests when emitting tests:run": function () {
            var listener = sinon.spy();
            this.emitter.on("suite:start", listener);

            buster.testCase("SomeTest", { "should do it": function () {} });
            this.emitter.emit("tests:run", { autoRun: true });

            assertTrue(listener.calledOnce);
        },

        "should run specs when emitting tests:run": function () {
            var listener = sinon.spy();
            this.emitter.on("context:start", listener);

            buster.spec.describe("Spec", function () {
                buster.spec.it("does it", function () {});
            });

            this.emitter.emit("tests:run", { autoRun: true });

            assertTrue(listener.calledOnce);
            assertEquals(listener.args[0][0].data.name, "Spec");
        },

        "should run parsable context when emitting tests:run": function () {
            var context = { name: "Parsed", tests: [{ name: "Yay" }], contexts: [] };

            buster.addTestContext({
                parse: function () {
                    return context;
                }
            });

            this.emitter.emit("tests:run", { autoRun: true });

            assertTrue(buster.testRunner.runSuite.calledOnce);
            assertEquals(buster.testRunner.runSuite.args[0][0], [context]);
        },

        "should create test runner with options": function () {
            this.emitter.emit("tests:run", {
                timeout: 25
            });

            assertEquals(25, buster.wiredRunner.timeout);
        },

        "should configure assertions to throw": function () {
            this.emitter.emit("tests:run");
            assertTrue(buster.assertions.throwOnFailure);
        },

        "should count assertions": function () {
            var counts = [];

            buster.testCase("AssertionCountTest", {
                tearDown: function () {
                    counts.push(buster.wiredRunner.assertionCount());
                },

                "test #1": function () {
                    buster.assert(true);
                },

                "test #2": function () {
                    buster.assert(true);
                    buster.assert(true);
                }
            });

            this.emitter.emit("tests:run");

            assertEquals(counts.sort(), [1, 2]);
        },

        "should filter contexts prior to running": function () {
            var tests = [this.spy(), this.spy()];
            buster.testCase("AssertionCountTest", {
                "test #1": tests[0],
                "test #2": tests[1]
            });

            this.emitter.emit("tests:run", { autoRun: true, filters: ["#1"] });

            assertTrue(tests[0].calledOnce);
            assertFalse(tests[1].called);
        },

        "should capture console": function () {
            this.stub(buster, "captureConsole");
            this.emitter.emit("tests:run", { captureConsole: true });
            assert(buster.captureConsole.calledOnce);
        },

        "should not always capture console": function () {
            this.stub(buster, "captureConsole");
            this.emitter.emit("tests:run", { captureConsole: false });
            assert(!buster.captureConsole.called);
        }
    });

    buster.util.testCase("BrowserWiringAutoRunFalseTest", {
        setUp: function () {
            setUp.call(this);

            this.listener = sinon.spy();
            this.emitter.on("suite:start", this.listener);
            buster.testCase("SomeTest", { "should do it": function () {} });
        },

        tearDown: tearDown,

        "should not start running tests on tests:run when autoRun is false":
        function () {
            this.emitter.emit("tests:run", { autoRun: false });

            assertFalse(this.listener.calledOnce);
        },

        "should start running tests when calling run after tests:run": function () {
            this.emitter.emit("tests:run", { autoRun: false });
            buster.run();

            assertTrue(this.listener.calledOnce);
        },

        "should start running tests when calling run before tests:run": function () {
            buster.run();
            this.emitter.emit("tests:run", { autoRun: false });

            assertTrue(this.listener.calledOnce);
        },

        "should remove all script tags": function () {
            buster.run();
            this.emitter.emit("tests:run", { autoRun: false });

            assertEquals(0, document.body.getElementsByTagName("script").length);
        }
    });
}(buster));
