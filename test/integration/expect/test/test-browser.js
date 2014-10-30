var assert = buster.assert;
var expect = buster.expect;

buster.testCase("amd", {

    "test mod": function () {
        assert.equals(mod.func(), "tut");
        expect(mod.func()).toBe("tut");
    }
});
