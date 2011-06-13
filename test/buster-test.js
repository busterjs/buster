var buster = require("../lib/buster");
var assert = buster.assert;

buster.testCase("Buster integration test", {
    "should count sinon assertions": function (done) {
        var testCase = buster.testCase("Sinon assertion count", {
            "should count two assertions": function () {
                var spy = this.spy();
                spy();
                spy(42);

                assert.calledTwice(spy);
                assert.calledWith(spy, 42);
            }
        });

        var runner = buster.testRunner.create();

        runner.on("suite:end", function (results) {
            assert.equals(results.assertions, 2);
            done();
        });

        runner.runSuite([testCase]);
    }
});
