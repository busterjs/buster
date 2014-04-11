


var config = module.exports;

config["Browser tests"] = {
  environment: "browser",
  sources: [
    'lib/**/*.js', '!lib/mod2.js'
  ],
  tests: ["test/test.js"],
  resources: ["res/file*.json", "!res/file2.json"]
}