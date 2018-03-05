
var puck = {
	word: "Moving",
	x: 100,
	y: 100,
	xDirection: 1, //+1 for leftwards, -1 for rightwards
	yDirection: 1, //+1 for downwards, -1 for upwards
	stringWidth: 50, //will be updated when drawn
	stringHeight: 24
}; //assumed height based on drawing point size

var timer; //used to control the free moving word
//intended for keyboard control
var movingBox = {
	x: 50,
	y: 50,
	width: 100,
	height: 100
};

var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById("canvas1"); //our drawing canvas
var fontPointSize = 18; //point size for word text
var wordHeight = 20; //estimated height of a string in the editor
var editorFont = "Arial"; //font for your editor

var drawCanvas = function() {
	var context = canvas.getContext("2d");

	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas

	context.font = "" + fontPointSize + "pt " + editorFont;
	context.fillStyle = "cornflowerblue";
	context.strokeStyle = "blue";

	puck.stringWidth = context.measureText(puck.word).width;
	context.fillText(puck.word, puck.x, puck.y);
	//draw moving box
	context.fillRect(movingBox.x, movingBox.y, movingBox.width, movingBox.height);

	context.stroke();
};

$(window).mousedown((e)=>{
	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
	//var canvasX = e.clientX - rect.left;
	//var canvasY = e.clientY - rect.top;
	var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
	var canvasY = e.pageY - rect.top;

	// Stop propagation of the event and stop any default
	//  browser action
	//e.stopPropagation();
	//e.preventDefault();

	drawCanvas();
}
});

function handleMouseDown(e) {
	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
	//var canvasX = e.clientX - rect.left;
	//var canvasY = e.clientY - rect.top;
	var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
	var canvasY = e.pageY - rect.top;
	console.log("mouse down:" + canvasX + ", " + canvasY);

	//console.log(wordBeingMoved.word);
	if (wordBeingMoved != null) {
		//deltaX = wordBeingMoved.x - canvasX;
		//deltaY = wordBeingMoved.y - canvasY;
		//attache mouse move and mouse up handlers
		$("#canvas1").mousemove(handleMouseMove);
		$("#canvas1").mouseup(handleMouseUp);
	}

	// Stop propagation of the event and stop any default
	//  browser action
	//e.stopPropagation();
	//e.preventDefault();

	drawCanvas();
}

function handleMouseMove(e) {
	console.log("mouse move");

	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
	var canvasX = e.pageX - rect.left;
	var canvasY = e.pageY - rect.top;

	//wordBeingMoved.x = canvasX + deltaX;
	//wordBeingMoved.y = canvasY + deltaY;

	//e.stopPropagation();

	drawCanvas();
}

function handleMouseUp(e) {
	console.log("mouse up");
	e.stopPropagation();
	//remove mouse move and mouse up handlers but leave mouse down handler
	$("#canvas1").off("mousemove", handleMouseMove); //remove mouse move handler
	$("#canvas1").off("mouseup", handleMouseUp); //remove mouse up handler

	drawCanvas(); //redraw the canvas
}

function movePuck(){
	// Handle moving word
	puck.x = puck.x + 2 * puck.xDirection;
	puck.y = puck.y + 2 * puck.yDirection;

	//keep moving word within bounds of canvas
	if (puck.x + puck.stringWidth > canvas.width)
		puck.xDirection = -1;
	if (puck.x < 0) puck.xDirection = 1;
	if (puck.y > canvas.height) puck.yDirection = -1;
	if (puck.y - puck.stringHeight < 0)
		puck.yDirection = 1;

}

function movePaddle(){
	const dXY = 5; //amount to move in both X and Y direction

	if(keysPressed[LEFT_ARROW] && movingBox.x >= dXY){

		movingBox.x -= dXY; //left arrow
		updateLocation();
	}
	if(keysPressed[UP_ARROW] && movingBox.y >= dXY){

		movingBox.y -= dXY;
		updateLocation();
	}
	if(keysPressed[DOWN_ARROW] && movingBox.y + movingBox.height + dXY <= canvas.height){

		movingBox.y += dXY; //down arrow
		updateLocation();
	}
	if(keysPressed[RIGHT_ARROW] && movingBox.x + movingBox.width + dXY <= canvas.width){

		movingBox.x += dXY; //right arrow
		updateLocation();
	}
}

function update() {

	movePaddle();
	movePuck();
	drawCanvas();
}

//KEY CODES
//should clean up these hard coded key codes
var RIGHT_ARROW = 39;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var DOWN_ARROW = 40;

// SOCKET EVENTS /////////////////////////////////////////
var socket = io('http://' + window.document.location.host);

socket.on('serverSays', function(data) {
	movingBox = JSON.parse(data);
});

// Only the first client is responsible for sending this
socket.on('sendMeWherePuckIs', function(data){
	console.log("OOOOOOOO");
	let responseData = JSON.stringify(puck);
	socket.emit('puckLocation', responseData);
});

// Update clients puck
socket.on('updatePuck', function(newPuckLocation){
	puck = JSON.parse(newPuckLocation);
	console.log(puck);
})
function updateLocation(){
	let data = JSON.stringify(movingBox);
	socket.emit('clientSays', data);
}
// SOCKET EVENTS /////////////////////////////////////////

let keysPressed = {};

$(window).keyup((e)=>{
	if(e.which == UP_ARROW || e.which == RIGHT_ARROW || e.which == LEFT_ARROW || e.which == DOWN_ARROW ){
		keysPressed[e.which] = false;
	}
});

$(window).keydown((e)=>{
	if(e.which == UP_ARROW || e.which == RIGHT_ARROW || e.which == LEFT_ARROW || e.which == DOWN_ARROW ){
		keysPressed[e.which] = true;

	}
});

$(document).ready(function() {
	//add mouse down listener to our canvas object
	$("#canvas1").mousedown(handleMouseDown);
	//add keyboard handler to document
	$(document).keydown(handleKeyDown);
	$(document).keyup(handleKeyUp);

	timer = setInterval(update, 60); //
	//pollingTimer = setInterval(pollingTimerHandler, 100); //quarter of a second
	//timer.clearInterval(); //to stop

	drawCanvas();
});
