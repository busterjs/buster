(function (glbl, buster, sinon) {
    if (typeof require == "function" && typeof module == "object") {
        var busterTest = require("buster-test");
        var path = require("path");
        var fs = require("fs");
        var referee = require("referee");
        var stackFilter = require("stack-filter");
        sinon = require("sinon");

        buster = module.exports = {
            testCase: busterTest.testCase,
            spec: busterTest.spec,
            testRunner: busterTest.testRunner,
            testContext: busterTest.testContext,
            reporters: busterTest.reporters,
            autoRun: busterTest.autoRun,
            referee: referee,
            assertions: referee,
            formatio: require("formatio"),
            eventedLogger: require("evented-logger"),
            frameworkExtension: require("./framework-extension"),
            wiringExtension: require("./wiring-extension"),
            sinon: require("buster-sinon"),
            refereeSinon: require("referee-sinon")
        };

        Object.defineProperty(buster, "VERSION", {
            get: function () {
                if (!this.version) {
                    var pkgJSON = path.resolve(__dirname, "..", "package.json");
                    var pkg = JSON.parse(fs.readFileSync(pkgJSON, "utf8"));
                    this.version = pkg.version;
                }

                return this.version;
            }
        });
    }

    var logFormatter = buster.formatio.configure({ quoteStrings: false });
    var asciiFormat = function () {
        return logFormatter.ascii.apply(logFormatter, arguments);
    };

    if (asciiFormat) {
        buster.console = buster.eventedLogger.create({
            formatter: asciiFormat,
            logFunctions: true
        });
    }

    buster.log = function () {
        return buster.console.log.apply(buster.console, arguments);
    };

    buster.captureConsole = function () {
        glbl.console = buster.console;

        if (glbl.console !== buster.console) {
            glbl.console.log = buster.log;
        }
    };

    if (asciiFormat) {
        buster.referee.format = asciiFormat;
    }

    buster.assert = buster.referee.assert;
    buster.refute = buster.referee.refute;
    buster.expect = buster.referee.expect;

    var hasDefineProperty = false;

    try {
        if (Object.defineProperty && Object.defineProperty({}, "x", {})) {
            hasDefineProperty = true;
        }
    } catch (e) {}

    if (hasDefineProperty) {
        Object.defineProperty(buster, "assertions", {
            get: function () {
                console.log("buster.assertions is provided for backwards compatibility. Please update your code to use buster.referee");
                return buster.referee;
            }
        });

        Object.defineProperty(buster, "format", {
            get: function () {
                console.log("buster.format is provided for backwards compatibility. Please update your code to use buster.formatio");
                return buster.formatio;
            }
        });
    } else {
        buster.assertions = buster.referee;
        buster.format = buster.formatio;
    }

    buster.testRunner.onCreate(function (runner) {
        buster.referee.on("pass", function () {
            runner.assertionPass();
        });

        buster.referee.on("failure", function (err) {
            runner.assertionFailure(err);
        });

        runner.on("test:async", function () {
            buster.referee.throwOnFailure = false;
        });

        runner.on("test:setUp", function () {
            buster.referee.throwOnFailure = true;
        });

        runner.on("context:start", function (context) {
            if (context.testCase) {
                context.testCase.log = buster.log;
            }
        });
    });

    var sf = typeof stackFilter !== "undefined" && stackFilter;
    buster.sinon(sinon, buster, sf, logFormatter);
    buster.refereeSinon(buster.referee, sinon);
}(typeof global != "undefined" ? global : this,
  typeof buster == "object" ? buster : null,
  typeof sinon == "object" ? sinon : null));
