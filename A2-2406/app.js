/*
Made by Nicholas Ellul - 101064168 and Peter Khlopenkov - 101072312
Made for COMP 2406 Assignment 1

This server code was based off of tutorial 2. It handles a request for song lyrics that are stored in a 
text file. It then returns an array where each element of the array is a line from the requested song.
My thought process was to let the client do most of the work for this because the work required by the browser 
is something quick to do.
*/

let http = require("http"); //need to http
let fs = require("fs"); //need to read static files and write songs to file
let url = require("url"); //to parse url strings

let counter = 1000; //to count invocations of function(req,res)

let ROOT_DIR = "html"; //dir to serve static files from
let ROOT_SONG_DIR = "songs";

let MIME_TYPES = {
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

let get_mime = function(filename) {
  let ext, type;
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
    let urlObj = url.parse(request.url, true, false);
    console.log("\n============================");
    console.log("PATHNAME: " + urlObj.pathname);
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
    console.log("METHOD: " + request.method);

    let receivedData = "";

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
          let dataObj = JSON.parse(receivedData);

        console.log("USER REQUEST: " + dataObj.text);

        if(dataObj.save === true){ //if this is a save request
            let filePath = ROOT_SONG_DIR + "/" + dataObj.text + ".txt";
            fs.writeFile(filePath,dataObj.newSong, function(err){
               if(err) throw err;
               console.log("Song saved to "+filePath);
            });
        } else {
            //find all saved files
            fs.readdir(ROOT_SONG_DIR, function (err, files) {
                if(err) throw err;
                let returnObj = {};
                let selectedSong = "";
                for(file of files){
                    file = file.slice(0,-4); //remove .txt from string
                    console.log(file);
                    if(file.toLowerCase() === dataObj.text.toLowerCase()){
                        selectedSong = file;
                        break;
                    }
                }

                // Generate the file path
                let filePath = ROOT_SONG_DIR + "/" + selectedSong + ".txt";

                // Read the file in
                fs.readFile(filePath, function (err, data) {
                    if (err) {
                        //report error to console
                        console.log("ERROR: Song not found.");
                        //respond with not found 404 to client
                        response.writeHead(404);
                        response.end(JSON.stringify(err));
                        return;
                    }

                    // Create the array of lyric lines from the data
                    returnObj.lyricsArray = String(data).split("\n");

                    //object to return to client
                    response.writeHead(200, {"Content-Type": MIME_TYPES["txt"]});
                    response.end(JSON.stringify(returnObj)); //send just the JSON object
                });
            });
        }


      }

      if (request.method == "GET") {
        //handle GET requests as static file requests
        let filePath = ROOT_DIR + urlObj.pathname;
        if (urlObj.pathname === "/") filePath = ROOT_DIR + "/assignment2.html";

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

console.log("Server Running at http://localhost:3000/  CNTL-C to quit");
