var config = module.exports;


config["browser tests"] = {
    environment: "browser",
    tests: [
        "*-test.js"
    ],
    libs: [
        "capture-server-test-helper.js"
    ]
};

