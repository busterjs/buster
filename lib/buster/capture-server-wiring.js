(function (B) {
    B.configureTestClient = function (emitter) {
        B.wire.uncaughtErrors(emitter);
        B.wire.logger(emitter);

        var wiring = B.wire(function () {
            var runner = B.testRunner.create({
                runtime: navigator.userAgent
            });
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
