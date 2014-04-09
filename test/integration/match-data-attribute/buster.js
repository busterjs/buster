var config = module.exports;

config["browser tests"] = {
    environment: "browser",
    tests: ["test*.js"],
    extensions: [require("buster-html-doc")]
};