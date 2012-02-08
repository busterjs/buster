if (typeof require != "undefined") {
    var buster = require("../../lib/buster");
    var when = require("when");
    var assert = require("assert");
}

buster.spec.expose();
var assertThat = buster.assert.that;

var spec = describe("Sample spec", function () {
    should("pass simple assertion", function () {
        assertThat(true).isTrue();
    });

    should("fail when test throws", function () {
        throw new Error("Ooops!");
    });

    should("fail test", function () {
        assertThat("Something").equals("Other");
    });

    describe("nested", function () {
        should("do it", function () {
            assertThat(true).isTrue();
        });
    });
});

var spec2 = describe("Another test", function () {
    before(function () {
        this.value = 42;
    });

    should("passes simple assertion", function () {
        assertThat(this.value).equals(42);
    });

    should("passes true assertion", function () {
        assertThat(true).isTrue();
    });

    should("passes node assertion", function () {
        assert.ok(true);
    });

    should("fail node assertion", function () {
        buster.console.warn("This is unsafe");
        assert.ok(false);
    });

    shouldEventually("is asynchronous", function () {
        var deferred = when.defer();

        setTimeout(function () {
            buster.log("Async");
            deferred.resolver.resolve();
        }, 1000);

        return deferred.promise;
    }),

    should("puts the lotion on its skin or else it gets the hose again", function () {
        assertThat(true).isTrue();
    });
});

var spec3 = describe("Third one", function () {
    should("should do #1", function () { assertThat(true).isTrue(); });
    should("should do #2", function () { assertThat(true).isTrue(); });
    should("should do #3", function () { assertThat(true).isTrue(); });
    should("should do #4", function () { assertThat(true).isTrue(); });
    should("should do #5", function () { assertThat(true).isTrue(); });
    should("should do #6", function () { assertThat(true).isTrue(); });
    should("should do #7", function () { assertThat(true).isTrue(); });
    should("should do #8", function () { assertThat(true).isTrue(); });
});
