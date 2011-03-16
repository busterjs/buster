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

// Assertion counting
var assertions = 0;

buster.assert.pass = function () {
    assertions += 1;
};

buster.testRunner.onCreate(function (runner) {
    runner.on("test:start", function () {
        assertions = 0;
    });
});

buster.testRunner.assertionCount = function () {
    return assertions;
};

var runner = buster.test.autoRun();

buster.testCase.onCreate = function (tc) {
    runner(tc);
};

buster.spec.describe.onCreate = buster.testCase.onCreate;
