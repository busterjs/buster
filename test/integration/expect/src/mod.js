((typeof define === "function" && define.amd && function (m) {
    define("mod", [], m);
}) || (typeof module === "object" && function (m) {
    module.exports = m();
}) || function (m) {
    this.mod = m();
})(function () {

    function func() {
        return ("tut");
    }

    return {
        func: func
    };
});