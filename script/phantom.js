if (phantom.state.length === 0) {
    phantom.state = "buster";
    phantom.open("http://localhost:1111/capture");
}
