var buster = require("buster");
var mod = require("../src/mod");
var assert = buster.assert;
var expect = buster.expect;

buster.testCase("expect", {

    "test mod": function () {
        assert.equals(mod.func(), "tut");
        expect(mod.func()).toBe("tut");
    },

    "should not fail if path.resolve is stubbed": function () {
        this.stub(require("path"), "resolve");
        expect(true).toBeTruthy();
    }
});
