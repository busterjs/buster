if (typeof require != "undefined") {
    var buster = require("buster-core");

    module.exports = buster.extend(buster, require("buster-test"), {
        assert: require("buster-assert"),
        format: require("buster-format"),
        eventedLogger: require("buster-evented-logger")
    });

    require("sinon-buster");
}

buster.console = buster.eventedLogger.create({ formatter: buster.format.ascii });
buster.log = buster.bind(buster.console, "log");
buster.assert.format = buster.format.ascii;

(function () {
    // Assertion counting
    var assertions = 0;

    buster.assert.on("pass", function () {
        assertions += 1;
    });

    buster.testRunner.onCreate(function (runner) {
        buster.assert.bind(runner, { "failure": "assertionFailure" });
        buster.assert.throwOnFailure = false;

        runner.on("test:start", function () {
            assertions = 0;
        });
    });

    buster.testRunner.assertionCount = function () {
        return assertions;
    };

    var runner = buster.autoRun({
        cwd: typeof process != "undefined" ? process.cwd() : null
    });

    buster.testCase.onCreate = function (tc) {
        runner(tc);
    };

    buster.spec.describe.onCreate = buster.testCase.onCreate;
}());
