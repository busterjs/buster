if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster");
}

var assert = buster.assert;

buster.testCase("sinon.match", {

    setUp : function () {
        this.obj = {
            someMethod : function () {}
        }
        this.mockedObj = this.mock(this.obj);
    },

    "verify that the typeOf matchers are working as expected" : function () {

        this.mockedObj.expects('someMethod').once().withArgs(
                buster.sinon.match.func).returns(1);
        this.mockedObj.expects('someMethod').once().withArgs(
                buster.sinon.match.string).returns(2);

        assert(this.obj.someMethod(function () {}), 1);
        assert(this.obj.someMethod("str"), 2);
    }
});