function createRemoteEmitter() {
    var emitter = buster.bane.createEventEmitter();

    emitter.emit = function (event, data) {
        return buster.emit.call(this, event, {
            data: data,
            topic: event
        });
    };

    emitter.connect = sinon.spy();
    return emitter;
}

buster.testRunner.onCreate(function (runner) {
    buster.wiredRunner = runner;
});
