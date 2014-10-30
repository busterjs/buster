define(['mod'], function(mod) {

    var assert = buster.assert;
    var expect = buster.expect;

    buster.testCase("amd tests", {

        "test mod": function () {
            assert.equals(mod.func(), "tut");
            expect(mod.func()).toBe("tut");
        }
    });
});