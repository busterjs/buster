if (typeof require != "undefined") {
    var buster = require("../../lib/buster-test");
    buster.promise = require("buster-promise");
    var assert = require("assert");
}

buster.spec.expose();

var spec = describe("Sample spec", function () {
    should("pass simple assertion", function () {
        buster.assert(true);
    });

    should("fail when test throws", function () {
        throw new Error("Ooops!");
    });

    should("fail test", function () {
        buster.assert.equals("Something", "Other");
    });

    describe("nested", function () {
        should("do it", function () {
            buster.assert(true);
        });
    });
});

var spec2 = describe("Another test", function () {
    before(function () {
        this.value = 42;
    });

    should("passes simple assertion", function () {
        buster.assert.equals(42, this.value);
    });

    should("passes true assertion", function () {
        buster.assert(true);
    });

    should("passes node assertion", function () {
        assert.ok(true);
    });

    should("fail node assertion", function () {
        assert.ok(false);
    });

    shouldEventually("is asynchronous", function () {
        var promise = buster.promise.create(function () {
            setTimeout(function () {
                console.log("Async");
                promise.resolve();
            }, 1000);
        });

        return promise;
    }),

    should("puts the lotion on its skin or else it gets the hose again", function () {
        buster.assert(true);
    });
});

var spec3 = describe("Third one", function () {
    should("should do #1", function () { buster.assert(true); });
    should("should do #2", function () { buster.assert(true); });
    should("should do #3", function () { buster.assert(true); });
    should("should do #4", function () { buster.assert(true); });
    should("should do #5", function () { buster.assert(true); });
    should("should do #6", function () { buster.assert(true); });
    should("should do #7", function () { buster.assert(true); });
    should("should do #8", function () { buster.assert(true); });
});
