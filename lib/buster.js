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
var runnerInstances = 0;

buster.assert.pass = function () {
    assertions += 1;
};

buster.testRunner.onCreate(function (runner) {
    runnerInstances += 1;

    runner.on("test:start", function () {
        assertions = 0;
    });
});

buster.testRunner.assertionCount = function () {
    return assertions;
};

var testCases = [], timer;

buster.testCase.onCreate = function (tc) {
    testCases.push(tc);

    clearTimeout(timer);
    setTimeout(autoRunTests, 0);
};

buster.spec.describe.onCreate = buster.testCase.onCreate;

function autoRunTests() {
    var reporter;

    if (runnerInstances == 0 && testCases.length > 0) {
        var runner = buster.testRunner.create({
            timeout: 750,
            failOnNoAssertions: false
        });

        var opt = {
            color: true,
            bright: true
        };

        if (typeof document != "undefined") {
            reporter = "html";
            opt.root = document.getElementById("buster") || document.body;
        } else {
            var env = process && process.env;
            reporter = env && env.BUSTER_REPORTER || "xUnitConsole";
        }

        var reporterInstance = buster.reporters[reporter].create(opt);
        reporterInstance.listen(runner);
        buster.console.bind(reporterInstance, "log");
        runner.runSuite(testCases);
    }
}
