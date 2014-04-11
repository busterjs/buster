var assert = buster.assert;

buster.testCase("backend proxy", {

    "forwards request to http://docs.busterjs.org/en/latest/" : function (done) {

        this.timeout = 10000;
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var data = xmlhttp.responseText;
                assert.match(data, "Welcome! Buster.JS is...");
                done();
            }
        };

        var url = buster.env.contextPath + "/app/en/latest/";
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
});
