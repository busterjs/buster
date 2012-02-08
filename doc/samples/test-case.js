if (typeof require != "undefined") {
    var buster = require("../../lib/buster");
    var when = require("when");
}

buster.testCase("Sample test", {
    setUp: function () {
        this.a = 1;
    },

    "should use sinon": function () {
        var obj = { meth: function () {} };
        this.spy(obj, "meth");
        buster.assert.called(obj.meth);
    },

    "should use sinon successfully": function () {
        var obj = { meth: function () {} };
        this.spy(obj, "meth");

        obj.meth();
        buster.log("Just called a spy, tihi");

        buster.assert.called(obj.meth);
    },

    "//should pass simple assertion": function () {
        buster.console.log("Trying shit out");
        buster.assert(true);
    },

    "should fail when test throws": function () {
        buster.console.warn("This gonna burn");
        throw new Error("Ooops!");
    },

    "should fail test": function () {
        buster.assert.equals("Something", "Other");
    },

    "should fail after timing out": function () {
        setTimeout(function () {
            throw new Error("Ah, crap!");
        }, 50);
    },

    "look ma, I'm asynchronous": function () {
        var deferred = when.defer();

        setTimeout(function () {
            buster.assert(true);
            deferred.resolver.resolve();
        }, 200);

        return deferred.promise;
    },

    "look ma, I'm implicitly asynchronous": function (done) {
        buster.assert(true);
        buster.console.error("This is not good");

        setTimeout(function () {
            buster.log("Failing assertion asynchronously");
            buster.assert(false);
            done();
        }, 50);
    },

    "context": {
        "should be awesome": function () {
            buster.assert.equals(1, 1);
        },

        "inside here": {
            setUp: function () {
                this.a += 1;
            },

            "should do it more": function () {
                buster.assert.equals(2, this.a);
            }
        }
    },

    "http stuff": {
        requiresSupportForAny: {
            "node http client": function () {
                return typeof require == "undefined";
            },

            "another thing": false
        },

        "should do it": function () {
            buster.assert(false);
        }
    }
});

var testCase2 = buster.testCase("Another test", {
    setUp: function (done) {
        setTimeout(function () {
            done();
        }, 200);
    },

    "should pass simple assertion": function () {
        buster.assert(true);
    },

    "should fail when test throws": function () {
        throw new Error("Ooops!");
    },

    "should fail test": function () {
        buster.assert.equals("Something", "Other");
    },

    "some context": {
        setUp: function (done) {
            setTimeout(function() {
                done();
            }, 240);
        },

        tearDown: function (done) {
            setTimeout(function() {
                done();
            }, 100);
        },

        "some other nested test": function () {
        }
    }
});
