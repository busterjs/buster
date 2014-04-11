var config = module.exports;
 

config["browser tests"] = {
    environment: "browser",
    tests: ["some-tests.js"],
    resources: [
        {
            path: "/app",
            backend: "http://docs.busterjs.org"
        }
    ]
};

