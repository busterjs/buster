if (typeof module === "object" && typeof require === "function") {
    var buster = module.exports = require("./buster/buster-wiring");
}

(function (glbl) {
    var tc = buster.testContext;
    if (tc.listeners && (tc.listeners.create || []).length > 0) { return; }

    tc.on("create", buster.autoRun({
        cwd: typeof process != "undefined" ? process.cwd() : null
    }));
}(typeof global != "undefined" ? global : this));
