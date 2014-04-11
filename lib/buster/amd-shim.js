this.buster = this.buster || {};
buster._ = buster.lodash = this._;
buster.when = this.when;
buster.async = this.async;
buster.platform = this.platform;

this.define = (function () {
    function resolve(ns) {
        var pieces = ns.replace(/^buster-test\//, "").replace(/-(.)/g, function (m, l) {
            return l.toUpperCase();
        }).split("/");

        return {
            property: pieces.pop(),
            object: buster._.reduce(pieces, function (ctx, name) {
                if (!ctx[name]) { ctx[name] = {}; }
                return ctx[name];
            }, buster)
        };
    }

    return function (id, dependencies, factory) {
        if (arguments.length === 2) {
            factory = dependencies;
            dependencies = [];
        }

        var deps = [], dep;

        for (var j, i = 0, l = dependencies.length; i < l; ++i) {
            dep = resolve(dependencies[i]);

            if (!dep.object[dep.property]) {
                throw new Error(id + " depends on unknown module " + dep.property);
            }
            deps.push(dep.object[dep.property]);
        }

        dep = resolve(id);
        dep.object[dep.property] = factory.apply(this, deps);
    };
}());

this.define.amd = true;
