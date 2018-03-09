
const app = require('http').createServer(handler)
const io = require('socket.io')(app) //wrap server app in socket io capability
const fs = require("fs"); //need to read static files
const url = require("url"); //to parse url strings

const PORT = process.env.PORT || 3000
app.listen(PORT) //start server listening on PORT

const counter = 1000; //to count invocations of function(req,res)

//server maintained location of moving box
let movingBoxLocation = { x: 100, y: 100 }; //will be over-written by clients

const ROOT_DIR = "html"; //dir to serve static files from

const MIME_TYPES = {
	css: "text/css",
	gif: "image/gif",
	htm: "text/html",
	html: "text/html",
	ico: "image/x-icon",
	jpeg: "image/jpeg",
	jpg: "image/jpeg",
	js: "application/javascript",
	json: "application/json",
	png: "image/png",
	txt: "text/plain"
};

function get_mime(filename) {
	let ext, type
	for (let ext in MIME_TYPES) {
		type = MIME_TYPES[ext]
		if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
			return type
		}
	}
	return MIME_TYPES["txt"]
}

let playersConnected = [];
let leftPaddleStatus = {claimed:false};
let rightPaddleStatus = {claimed:false};
let leftScore = 0,
	rightScore = 0;

function resetScore(){
	leftScore = 0;
	rightScore = 0;

	io.emit('leftGoal',JSON.stringify({score:leftScore}));
	io.emit('rightGoal', JSON.stringify({score:rightScore}));
}

io.on('connection', function(socket){

	playersConnected.push(socket.id);
	console.log("there are " + playersConnected.length);
	console.log("This boi " + socket.id + " connected");


	socket.on('init', (data) =>{

		if(leftPaddleStatus.claimed == true){

			io.sockets.connected[socket.id].emit('leftPlayerClaimed',
												 JSON.stringify({claimed:true})); 
		}
		if(rightPaddleStatus.claimed == true){

			io.sockets.connected[socket.id].emit('rightPlayerClaimed',// change to just broadcast to one dude
												 JSON.stringify({claimed:true})); 
		}
		if(playersConnected.length > 1) {
			socket.broadcast.to(playersConnected[0]).emit('sendMeWherePuckIs'); 
		}
	});

	socket.on('puckLocation', (data) =>{


		io.emit('updatePuck',data);
	});
	// Data is true or false
	socket.on('claimPlayerRight', (data) =>{
		console.log("Owner : " + socket.id);
		rightPaddleStatus.owner = socket.id;
		rightPaddleStatus.claimed = data;
		io.emit('rightPlayerClaimed',data);
	});
	socket.on('claimPlayerLeft', (data) =>{
		console.log("Owner : " + socket.id);
		leftPaddleStatus.owner = socket.id;
		leftPaddleStatus.claimed = data;
		io.emit('leftPlayerClaimed', data);
	});
	socket.on('clientSays', (data) =>{
		socket.broadcast.emit('serverSays', data);
	});
	socket.on('leftPlayerUpdate', (data) =>{
		socket.broadcast.emit('leftPlayerUpdate',data);
	});
	socket.on('rightPlayerUpdate', (data) =>{

		socket.broadcast.emit('rightPlayerUpdate',data);
	});
	socket.on('leftGoal',(data) =>{
		leftScore++;
		io.emit('leftGoal',JSON.stringify({score:leftScore}));

	});
	socket.on('rightGoal', (data) =>{
		rightScore++
		io.emit('rightGoal', JSON.stringify({score:rightScore}));

	});
	socket.on('disconnect', (reason) =>{
		console.log("This boi " + socket.id + " disconnected");


		if(leftPaddleStatus.owner == socket.id){

			leftPaddleStatus.claimed = false;
			resetScore();
			io.emit('leftPlayerClaimed', false);
		}
		if(rightPaddleStatus.owner == socket.id){
			rightPaddleStatus.claimed = false;
			resetScore();
			io.emit('rightPlayerClaimed', false);
		}

		// Remove this player from our list of players while maintaining queue order
		for(var i = 0; i < playersConnected.length; i++){
			if(playersConnected[i] == socket.id) break;
		}

		for(let j = i; j < playersConnected.length - 1; j++){
			playersConnected[j] = playersConnected[j+1];
		}
		playersConnected.pop();
	});
});



function handler(request, response) {
	let urlObj = url.parse(request.url, true, false)
	let receivedData = "";

	//attached event handlers to collect the message data
	request.on("data", function(chunk) {
		receivedData += chunk;
	})

	//event handler for the end of the message
	request.on("end", function() {

		if (request.method == "GET") {
			//handle GET requests as static file requests
			fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
				if (err) {
					console.log("ERROR: " + JSON.stringify(err))
					response.writeHead(404)
					response.end(JSON.stringify(err))
					return
				}
				response.writeHead(200, {
					"Content-Type": get_mime(urlObj.pathname)
				})
				response.end(data)
			})
		}
	})
}


console.log("Server Running at PORT: 3000  CNTL-C to quit");
console.log("To Test: open several browsers at: http://localhost:3000/canvasWithTimer.html")
