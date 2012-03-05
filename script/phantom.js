if(!phantom.state) {
    phantom.state = "buster";
    var page = new WebPage();
    page.open("http://localhost:1111/capture", function(status) {
          console.log(status);
        });
}
