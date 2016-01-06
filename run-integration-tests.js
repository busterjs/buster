if (process.env["NO_INTEGRATION"]) {
    console.log("Found NO_INTEGRATION environment variable - skipping tests");
    process.exit(0);
}

var when = require('when');
var path = require('path');
var fs = require('fs');
var nodefn = require('when/node/function');
var sequence = require('when/sequence');
var cp = require('child_process');

var BUSTER_SERVER_BIN = path.join(__dirname, "bin", "buster-server");
var BUSTER_TEST_BIN = path.join(__dirname, "bin", "buster-test");

function die(code) {
    if (code > 0) {
        console.error("Exiting with code " + code);
    } else {
        console.log("Exiting with code " + code);
    }
    process.exit(code);
}

function startServer() {
    var started = false;
    var serverExited = when.defer();
    var serverStarted = when.defer();

    var serverProcess = cp.spawn("node", [BUSTER_SERVER_BIN, "-c"], {detached: true});

    serverProcess.stdout.on('data', function (data) {
        var msg = data.toString();
        if (!started && /Headless browser was captured/.test(msg)) {
            started = true;
            serverStarted.resolve();
            clearTimeout(capturedTimeout);
        }
        console.log("[buster-server][stdout]", msg);
    });

    serverProcess.stderr.on('data', function (data) {
        console.error("[buster-server][stderr]", data.toString());
    });

    serverProcess.on('exit', function (code) {
        if (!started) {
            serverStarted.reject(new Error("buster-server crashed"));
        }

        if (code > 0 || code === 143) { // see: https://github.com/nodejs/node-v0.x-archive/issues/8667
            console.log("buster-server exited with code " + code);
        }

        serverExited.resolve(code === 143 ? 0 : code);
    });

    var capturedTimeout = setTimeout(function () {
        serverStarted.reject(new Error("Timed out while waiting for buster-server to capture a headless browser"));
    }, 5000);

    return {
        started: serverStarted.promise,
        exited: serverExited.promise,
        kill: function () {
            var isWin = /^win/.test(process.platform);
            if (isWin) {
                cp.spawn("taskkill", ["/pid", serverProcess.pid, '/f', '/t']);
            } else {
                process.kill(-serverProcess.pid);
            }
        }
    }
}

function readArgs(dirName) {
    var fullPath = path.join(__dirname, "test", "integration", dirName);
    return nodefn.call(fs.readFile.bind(fs), path.join(fullPath, "args.txt"))
        .then(function (contents) {
            return {
                fullPath: fullPath,
                args: contents.toString()
            };
        }, function (err) {
            if (err && err.code === "ENOENT") {
                return {
                    fullPath: fullPath,
                    args: undefined
                };
            }
            throw err;
        });
}

function readTestFolders() {
    return nodefn.call(fs.readdir.bind(fs), path.join(__dirname, "test", "integration"))
        .then(function (integrationTests) {
            return when.map(integrationTests, readArgs)
        })
}

function getRunTestFn(integrationTest) {
    return function () {
        var deferred = when.defer();
        var cmd = ["BUSTER_REPORTER=specification", "node", BUSTER_TEST_BIN];
        if (integrationTest.args) {
            cmd.push(integrationTest.args);
        }
        var execOptions = {
            cwd: integrationTest.fullPath
        };
        cp.exec(cmd.join(" "), execOptions, function (err, stdout, stderr) {
            if (err) {
                console.error(err);
            }
            if (stdout.length) {
                console.log("[buster-test][stdout][" + integrationTest.fullPath + "]", stdout);
            }
            if (stderr.length) {
                console.log("[buster-test][stderr][" + integrationTest.fullPath + "]", stderr);
            }
            deferred.resolver.resolve(err ? 1 : 0);
        });
        return deferred.promise;
    }
}

function runIntegrationTests() {
    var server = startServer();

    process.on('SIGINT', function () {
        server.kill();
        die(1);
    });

    server.started
        .then(function () {
            return readTestFolders();
        })
        .then(function (tests) {
            var deferred = when.defer(); // @todo: replace with when.race()

            sequence(tests.map(getRunTestFn))
                .then(deferred.resolver.resolve);

            server.exited
                .then(function () {
                    deferred.resolver.reject(new Error("Server exited before test results completed!"));
                });

            return deferred.promise;
        })
        .then(function (testResults) {
            server.kill();
            return when.all(testResults.concat(server.exited));
        })
        .then(function (exitCodes) {
            var nonZero = exitCodes.filter(function (i) {
                return i > 0 && i !== 143
            });

            if (nonZero.length > 0) {
                console.log("One or more processes exited with non-zero exit code", exitCodes);
                die(1);
                return;
            }

            die(0);
        })
        .then(null, function (err) {
            console.error(err);
            server.kill();
            die(1);
        });
}

runIntegrationTests();
