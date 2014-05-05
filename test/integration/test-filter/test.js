var buster = require("buster");

var assert = buster.assert;
var fail = buster.referee.fail;

buster.testCase("filter by test name", {

    "test to run": function () {
        assert(true);
    },
    
    "test to be filtered out": function () {
        fail("Test should have been filtered out!");
    }
});
