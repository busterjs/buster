if (typeof require != "undefined") {
    var buster = require("buster-core");

    module.exports = buster.extend(buster, require("buster-test"), {
        assertions: require("buster-assertions"),
        format: require("buster-format"),
        eventedLogger: require("buster-evented-logger")
    });

    buster.defineVersionGetter(module.exports, __dirname);
    require("sinon-buster");
}

buster.console = buster.eventedLogger.create({ formatter: buster.format.ascii });
buster.log = buster.bind(buster.console, "log");
buster.assertions.format = buster.format.ascii;
buster.assert = buster.assertions.assert;
buster.refute = buster.assertions.refute;

(function () {
    // Assertion counting
    var assertions = 0;

    buster.assertions.on("pass", function () {
        assertions += 1;
    });

    buster.testRunner.onCreate(function (runner) {
        buster.assertions.bind(runner, { "failure": "assertionFailure" });
        buster.assertions.throwOnFailure = false;

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

    if (!buster.testCase.onCreate) {
        buster.testCase.onCreate = runner;
        buster.spec.describe.onCreate = buster.testCase.onCreate;
    }
}());
