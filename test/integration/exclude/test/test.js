var assert = buster.assert;
var refute = buster.refute;
var fail = buster.referee.fail;

buster.testCase("exclude test", {

    "mod1 should be loaded" : function () {
        assert.isObject(window.mod1);
    },

    "mod2 should not be loaded" : function () {
        refute.isObject(window.mod2);
    },

    "for resources" : {
        setUp : function () {
            this.timeout = 10000;
            this.get = function(url, cb) {

                var xmlhttp = new XMLHttpRequest();
                var errorCbs = [];

                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4) {

                        if (xmlhttp.status == 200) {
                            var data = xmlhttp.responseText;
                            cb(data);
                        } else {
                            for ( var i = 0; i < errorCbs.length; i++) {
                                errorCbs[i]("Error " + xmlhttp.status)
                            }
                        }
                    }
                };
                xmlhttp.open("GET", url, true);
                xmlhttp.send();

                return {
                    fail : function(cb) {
                        errorCbs.push(cb);
                    }
                }
            };
        },

        "load file1.json" : function (done) {
            this.get(buster.env.contextPath + "/res/file1.json",
                    done(function(data) {
                        assert.equals(JSON.parse(data).value, "test");
                    }));
        },

        "file2.json can't be loaded" : function (done) {
            this.get(buster.env.contextPath + "/res/file2.json",
                    done(function(data) {
                        fail("Error 404 expected!");
                    })).fail(done(function(err) {
                assert.match(err, "Error 404");
            }));
        }
    }
});