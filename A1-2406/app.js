// Made by Nicholas Ellul - 101064168
// Made for COMP 2406 Assignment 1

// This server code was based off of tutorial 2. It handles a request for song lyrics that are stored in a 
// text file. It then returns an array where each element of the array is a line from the requested song.
// My thought process was to let the client do most of the work for this because the work required by the browser 
// is something quick to do.

//Server Code
var http = require("http"); //need to http
var fs = require("fs"); //need to read static files
var url = require("url"); //to parse url strings

var counter = 1000; //to count invocations of function(req,res)

var ROOT_DIR = "html"; //dir to serve static files from
var ROOT_SONG_DIR = "songs";

var MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript", //should really be application/javascript
  json: "application/json",
  png: "image/png",
  txt: "text/plain"
};

var get_mime = function(filename) {
  var ext, type;
  for (ext in MIME_TYPES) {
    type = MIME_TYPES[ext];
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return type;
    }
  }
  return MIME_TYPES["txt"];
};

http
  .createServer(function(request, response) {
    var urlObj = url.parse(request.url, true, false);
    console.log("\n============================");
    console.log("PATHNAME: " + urlObj.pathname);
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
    console.log("METHOD: " + request.method);

    var receivedData = "";

    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk;
    });

    //event handler for the end of the message
    request.on("end", function() {
      console.log("received data: ", receivedData);
      console.log("type: ", typeof receivedData);

      //if it is a POST request then echo back the data.
      if (request.method == "POST") {
        var dataObj = JSON.parse(receivedData);
          
        console.log("USER REQUEST: " + dataObj.text);
          
        var returnObj = {};
        let selectedSong = "";
        
        // figure out what song the server should load
        if (dataObj.text.toLowerCase() === "peaceful easy feeling" ) {
          selectedSong = "Peaceful Easy Feeling";
        }
        else if (dataObj.text.toLowerCase() === "sister golden hair") {
          //returnObj.wordArray = sisterGoldenHair;
            selectedSong = "Sister Golden Hair";
        }
        else if (dataObj.text.toLowerCase() === "brown eyed girl") {
          //returnObj.wordArray = brownEyedGirl;
            selectedSong = "Brown Eyed Girl";
        }
        
        // Generate the file path
        let filePath = ROOT_SONG_DIR + "/" + selectedSong + ".txt";
          
        // Read the file in
        fs.readFile(filePath, function(err,data){
            if (err) {
                //report error to console
                console.log("ERROR: " + JSON.stringify(err));
                //respond with not found 404 to client
                response.writeHead(404);
                response.end(JSON.stringify(err));
                return;
            }
        
            // Create the array of lyric lines from the data
            returnObj.lyricsArray = String(data).split("\n");

            //object to return to client
            response.writeHead(200, { "Content-Type": MIME_TYPES["txt"] });
            response.end(JSON.stringify(returnObj)); //send just the JSON object
        });
      }

      if (request.method == "GET") {
        //handle GET requests as static file requests
        var filePath = ROOT_DIR + urlObj.pathname;
        if (urlObj.pathname === "/") filePath = ROOT_DIR + "/assignment1.html";

        fs.readFile(filePath, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err));
            //respond with not found 404 to client
            response.writeHead(404);
            response.end(JSON.stringify(err));
            return;
          }
          response.writeHead(200, { "Content-Type": get_mime(filePath) });
          response.end(data);
        });
      }
    });
  })
  .listen(3000);

console.log("Server Running at http://127.0.0.1:3000  CNTL-C to quit");
