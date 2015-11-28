// WHOA! This will change before 1.0

function resolveModules(resourceSet, modules) {
    return modules.map(function (module) {
        var moduleName = module[0];
        var moduleFile = module[1];
        var resourcePath = "/buster/" + moduleFile;
        var absolutePath = require.resolve(moduleName + moduleFile);
        resourceSet.addFileResource(absolutePath, { path: resourcePath });
        return resourcePath;
    });
}

var when = require("when");

var NO_CACHE_HEADERS = {
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Expires": "0"
};

function loadTestFramework(configuration) {
    configuration.on("load:framework", function (rs) {
        var files = resolveModules(rs, [
            ["when/", "when.js"],
            ["lodash/dist/", "lodash.js"],
            ["async/lib/", "async.js"],
            ["platform/", "platform.js"],
            ["../", "buster/amd-shim.js"],
            ["bane/lib/", "bane.js"],
            ["samsam/lib/", "samsam.js"],
            ["evented-logger/lib/", "evented-logger.js"],
            ["referee/lib/", "expect.js"],
            ["referee/lib/", "referee.js"],
            ["formatio/lib/", "formatio.js"],
            ["sinon/pkg/", "sinon.js"],
            ["buster-test/lib/", "seedrandom.js"],
            ["buster-test/lib/", "browser-env.js"],
            ["buster-test/lib/", "test-context.js"],
            ["buster-test/lib/", "spec.js"],
            ["buster-test/lib/", "test-case.js"],
            ["buster-test/lib/", "test-runner.js"],
            ["buster-test/lib/", "reporters/json-proxy.js"],
            ["referee-sinon/lib/", "referee-sinon.js"],
            ["buster-sinon/lib/", "buster-sinon.js"],

            // Slightly silly, will be fixed
            ["../", "buster/buster-wiring.js"],
            ["../", "buster/browser-wiring.js"]
        ]);

        var ieFiles = resolveModules(rs, [
            ["sinon/pkg/", "sinon-ie.js"]
        ]);

        var compatResourceName = "/buster/compat-0.7.js";
        var bundleResourceName = "/buster/bundle-0.7.js";

        when.all([
            rs.addResource({
                path: compatResourceName,
                combine: ieFiles,
                headers: NO_CACHE_HEADERS
            }),
            rs.addResource({
                path: bundleResourceName,
                combine: files,
                headers: NO_CACHE_HEADERS
            })
        ], function () {
            rs.loadPath.prepend(compatResourceName);
            rs.loadPath.prepend(bundleResourceName);
        }.bind(this));
    }.bind(this));
}

module.exports = {
    configure: function (configuration) { loadTestFramework(configuration); }
};
