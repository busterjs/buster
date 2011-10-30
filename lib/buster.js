if (typeof require != "undefined") {
    var buster = module.exports = require("./buster/buster-wiring");
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
