var config = module.exports;

config["browser tests"] = {
    environment: "browser",
    sources: ["src/mod.js"],
    tests: ["test/test-browser.js"]
};

config["browser amd tests"] = {
    environment: "browser",
    libs: [
        "lib/require.js",
        "config.js"
    ],
    sources: ["src/mod.js"],
    tests: ["test/test-browser-amd.js"],
    extensions: [require("buster-amd")],
    "buster-amd": {
        pathMapper: function (path) {
          return path.
                 // remove extension
                 replace(/\.js$/, "").
                 // replace leading slash with previous directory for test files
                 replace(/^\//, "../");
        }
    }
};

config["node tests"] = {
    environment: "node",
    tests: ["test/test-node.js"]
};


