// This is the server side code. It is written in a cost efficient way 
// so that the client does most of the work
// Written by Nicholas Ellul - 101064168

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

// Resets the score on the server, and tells the client to do the same
function resetScore(){
	leftScore = 0;
	rightScore = 0;

	io.emit('leftGoal',JSON.stringify({score:leftScore}));
	io.emit('rightGoal', JSON.stringify({score:rightScore}));
}

io.on('connection', function(socket){

	// Add the socket to a list of players
	playersConnected.push(socket.id);
	
	// Init updates the new player with the status of the game
	socket.on('init', (data) =>{
		socket.broadcast.emit('newPlayerJoined'); // Tell players new player joined to get data
		
		// If left paddle is claimed, reflect this in the new clients browser
		if(leftPaddleStatus.claimed == true){
			io.sockets.connected[socket.id].emit('leftPlayerClaimed',
												 JSON.stringify({claimed:true})); 
		}
		// If right paddle is claimed, reflect this in the new clients browser
		if(rightPaddleStatus.claimed == true){
			io.sockets.connected[socket.id].emit('rightPlayerClaimed',// change to just broadcast to one dude
												 JSON.stringify({claimed:true})); 
		}
		// Ask the first player (oldest player) for the ball's position
		if(playersConnected.length > 1) {
			socket.broadcast.to(playersConnected[0]).emit('sendMeWhereBallIs'); 
		}
	});

	// When given the ball's location from one client, send it to everyone to sync up
	// Data is going to be a ball object
	socket.on('ballLocation', (data) =>{
		io.emit('updateBall',data);
	});

	// If a client says theyve claimed/released a paddle, broadcast this to all the clients
	// Data is going to be true or false in an object
	socket.on('claimPlayerRight', (data) =>{
		rightPaddleStatus.owner = socket.id;
		rightPaddleStatus.claimed = JSON.parse(data).claimed;
		io.emit('rightPlayerClaimed',data);
	});
	socket.on('claimPlayerLeft', (data) =>{
		leftPaddleStatus.owner = socket.id;
		leftPaddleStatus.claimed = JSON.parse(data).claimed;
		io.emit('leftPlayerClaimed', data);
	});
	
	// If a player sends an update of their position, broadcast this position to everyone
	// Data in this case is the Y position of the paddle in an object
	socket.on('leftPlayerUpdate', (data) =>{
		socket.broadcast.emit('leftPlayerUpdate',data);
	});
	socket.on('rightPlayerUpdate', (data) =>{

		socket.broadcast.emit('rightPlayerUpdate',data);
	});
	
	// If the server is notified of a goal, broacast this to all the clients
	socket.on('leftGoal',(data) =>{
		leftScore++;
		io.emit('leftGoal',JSON.stringify({score:leftScore}));

	});
	socket.on('rightGoal', (data) =>{
		rightScore++
		io.emit('rightGoal', JSON.stringify({score:rightScore}));

	});
	
	socket.on('disconnect', (reason) =>{

		// If a player owning a paddle discconects, remove his ownership for him
		if(leftPaddleStatus.owner == socket.id){

			leftPaddleStatus.claimed = false;
			resetScore();
			io.emit('leftPlayerClaimed', JSON.stringify({claimed:false}));
		}
		if(rightPaddleStatus.owner == socket.id){
			rightPaddleStatus.claimed = false;
			resetScore();
			io.emit('rightPlayerClaimed', JSON.stringify({claimed:false}));
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


// Handles HTTP server requests
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
console.log("To Test: open several browsers at: http://localhost:3000/assignment3.html")
