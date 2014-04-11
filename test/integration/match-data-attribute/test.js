buster.spec.expose();
var expect = buster.referee.expect;

var spec = describe("DOM elements with data attibute", function () {
    it("match dom element", function () {
        /*:DOC element = <input type="checkbox" id="id1" data-path="foo.bar">*/
        expect(this.element).toMatch({id: 'id1', type:'checkbox', 'data-path':'foo.bar'}); 
    });
    
    it("not match dom element", function () {
        /*:DOC element = <input type="checkbox" id="id1" data-path="foo.foo">*/
        expect(this.element).not.toMatch({id: 'id1', type:'checkbox', 'data-path':'foo.bar'}); 
    });
});