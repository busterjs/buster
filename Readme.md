This project is just wiring of individual buster projects. It has no unit tests
for this wiring, but the doc/samples directory includes some test cases that can
be run both on node and in browsers to verify that it works. To run on node,
simply do

    node doc/samples/test-case.js
    node doc/samples/spec.js
    node doc/samples/strftime.js

To run in browsers:

    ./build

And then load the HTML files in doc/samples in a browser.
