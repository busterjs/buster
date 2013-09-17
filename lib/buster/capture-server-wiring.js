(function (B) {
    B.configureTestClient = function (emitter) {
        function runtimeEmitter(runner) {
            return {
                emit: function (event, data) {
                    data.runtime = runner.runtime;
                    emitter.emit(event, data);
                }
            };
        }

        var wiring = B.wire(function () {
            var runner = B.testRunner.create({
                runtime: navigator.userAgent
            });
            var re = runtimeEmitter(runner);
            B.wire.logger(re);
            B.wire.uncaughtErrors(re);
            var reporter = B.reporters.jsonProxy.create(emitter);
            reporter.listen(runner);
            return runner;
        });

        // TODO: FIX FIX FIX
        B.configureTestRun = wiring.ready;
    };

    if (B.on && B.emit) {
        B.configureTestClient(B);
    }
}(buster));
