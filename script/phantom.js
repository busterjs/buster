phantom.silent = false;

var page = new WebPage();

page.open("http://localhost:1111/capture", function(status) {
  if(!phantom.silent){
    console.log(status);

    page.onConsoleMessage = function (msg, line, id) {
      var fileName = id.split('/');
      // format the output message with filename, line number and message
      // weird gotcha: phantom only uses the first console.log argument it gets :(
      console.log(fileName[fileName.length-1]+', '+ line +': '+ msg);
    };

    page.onAlert = function(msg) {
      console.log(msg);
    };
  }
});
