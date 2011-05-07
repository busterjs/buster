if (typeof require != "undefined") {
    var buster = require("../../lib/buster");
    require("./strftime");
}

var assert = buster.assert;

buster.testCase("Date.prototype.strftime", {
    setUp: function () {
        this.date = new Date(2009, 9, 2, 22, 14, 45);
    },

    "%Y should return full year": function () {
        var year = Date.formats.Y(this.date);

        assert.isNumber(year);
        assert.equals(year, 2009);
    },

    "%m should return month": function () {
        var month = Date.formats.m(this.date);

        assert.isString(month);
        assert.equals(month, "10");
    },

    "%d should return date": function () {
        assert.equals(Date.formats.d(this.date), "02");
    },

    "%y should return year as two digits": function () {
        assert.equals(Date.formats.y(this.date), "09");
    },

    "%F should act as %Y-%m-%d": function () {
        assert.equals(this.date.strftime("%F"), "2009-10-02");
    }
});
