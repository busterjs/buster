var when = require('when');
var path = require('path');
var fs = require('fs');
var nodefn = require('when/node/function');
var sequence = require('when/sequence');
var cp = require('child_process');

var BUSTER_SERVER_BIN = path.join(__dirname, "bin", "buster-server");
var BUSTER_TEST_BIN = path.join(__dirname, "bin", "buster-test");

function startServer() {
    var started = false;
    var serverExited = when.defer();
    var serverStarted = when.defer();

    var serverProcess = cp.spawn(BUSTER_SERVER_BIN, ["-c"], {detached: true});

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
            process.kill(-serverProcess.pid);
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

    process.on('SIGINT', function() {
        server.kill();
        process.exit();
    });

    server.started
        .then(function () {
            return readTestFolders();
        })
        .then(function (tests) {
            return sequence(tests.map(getRunTestFn));
        })
        .then(function (testResults) {
            server.kill();
            return when.all(testResults.concat(server.exited));
        })
        .then(function (exitCodes) {
            var sum = exitCodes.reduce(function (c, i) {
                return c + (i || 0);
            }, 0);
            process.exit(sum);
        })
        .then(null, function (err) {
            console.error(err);
            server.kill();
            process.exit(1);
        });
}

runIntegrationTests();
