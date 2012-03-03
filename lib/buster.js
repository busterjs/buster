if (typeof module === "object" && typeof require === "function") {
    var buster = module.exports = require("./buster/buster-wiring");
    module.exports.cli = require("buster-test-cli").cli;
}

(function (glbl) {
    glbl.buster = buster;
    if (buster.testCase.onCreate) return;

    var runner = buster.autoRun({
        cwd: typeof process != "undefined" ? process.cwd() : null
    });

    buster.testCase.onCreate = runner;
    buster.spec.describe.onCreate = buster.testCase.onCreate;
}(typeof global != "undefined" ? global : this));
