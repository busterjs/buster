var config = module.exports;

config["browser tests"] = {
    environment : "browser",
    tests : [ "test.js" ]
};

config["node tests"] = {
    environment : "node",
    tests : [ "test.js" ]
};