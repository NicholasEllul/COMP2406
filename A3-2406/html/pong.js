// Client side code for Pong
// Written by Nicholas Ellul 101064168

// Note to TA: Given the opportunity to work with a partner, I said no because working
// though the assignment on my own allowed me to get far much more practice with Javascript than 
// if I had other people writing code for me.

// That being said, Lukas Romsicki and I collaborated on ideas making him a *passive* partner
// and i'd like to disclose that here.

'use strict';

let timer; //used to control the free moving word

let canvas = document.getElementById("canvas1"); //our drawing canvas

// Keep track of score locally
let leftScore = 0,
	rightScore = 0;

// Player Objects
let leftPlayer = new Player(5, canvas.height/2-50, 10, 100);
let rightPlayer = new Player(canvas.width - 15, canvas.height/2-50, 10, 100);

//KEY CODES
const UP_ARROW = 38;
const DOWN_ARROW = 40;

// Object holding true or false representing if its being held for each keycode
let keysPressed = {};

// Booleans used to identify client
let isLeftPlayer = false,
	isRightPlayer = false;

// Booleans holding the claimed state of paddles
let leftClaimed = false,
	rightClaimed = false;

// Speed of ball
const BALL_SPEED = 4;
let ballActive = true; // Used to toggle when ball is active (its disabled after goal is scored)

// Ball object
let gameBall = new Ball(300, 150, 10,BALL_SPEED);

// The clients name
let name;

let socket = io('http://' + window.document.location.host);

// When right button is clicked
$("#btnRight").click(function () {
	// if the user doesnt have a paddle yet, assign the right paddle to them
	if (!isLeftPlayer && !isRightPlayer) {
		isRightPlayer = true;
		$("#btnLeft").prop('disabled', true); // Make other button inaccessible
		$("#btnRight").html(name);
		rightPlayer.enableOwnershipColour(true);
		socket.emit('claimPlayerRight',JSON.stringify({claimed:true}));
		return;
	}
	// if user was in ownership of the right paddle, remove the ownership
	if(isRightPlayer){
		isRightPlayer = false;
		if(leftClaimed == false){
			$("#btnLeft").prop('disabled', false);
		}
		$("#btnRight").html("Join");
		rightPlayer.enableOwnershipColour(false);
		socket.emit('claimPlayerRight',JSON.stringify({claimed:false}));
	}
});

// When left button is clicked
$("#btnLeft").click(function () {
	// if the user doesnt have a paddle yet, assign the left paddle to them
	if (!isRightPlayer && !isLeftPlayer) {
		isLeftPlayer = true;
		
		$("#btnRight").prop('disabled', true); // Make other button inaccessible
		$("#btnLeft").html(name);
		
		leftPlayer.enableOwnershipColour(true);
		socket.emit('claimPlayerLeft',JSON.stringify({claimed:true}));
		return;
	}
	// if user was in ownership of the left paddle, remove the ownership
	if(isLeftPlayer){
		isLeftPlayer = false;
		if(rightClaimed == false){ // if the other button is taken by a user, disable it
			$("#btnRight").prop('disabled', false);
		}
		$("#btnLeft").html("Join");
		leftPlayer.enableOwnershipColour(false);
		socket.emit('claimPlayerLeft',JSON.stringify({claimed:false}));
	}
});


// Player object constuctor
function Player(x, y, width, height, id) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.id = id;
	this.colour = "#ff1744";
	
	// called once per frame to draw player
	this.draw = function (context) {
		context.beginPath();
		context.lineWidth=5;
		context.strokeStyle = this.colour;
		context.strokeRect(this.x, this.y, this.width, this.height);
		context.stroke();
		context.closePath();
	}
	
	// function to enable the green colour indicating ownership
	this.enableOwnershipColour = function(activateColour){
		
		if(activateColour){
			this.colour = "#00e676";
		}
		else{
			this.colour = "#ff1744";
		}
	}
}

// Ball constructor function 
function Ball(x, y, radius, speed) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.xSpeed = speed;
	this.ySpeed = speed;

	this.draw = function (context) {
		
		// Only move the ball if its active
		if(ballActive == true){
			this.x += this.xSpeed;
			this.y += this.ySpeed;
		}
		context.beginPath();
		context.lineWidth = 4;
		context.strokeStyle = "#40c4ff";
		context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
		context.stroke();
		context.closePath();
	}
}


var drawCanvas = function () {
	var context = canvas.getContext("2d");

	context.fillStyle = "#000000";
	context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas
	
	leftPlayer.draw(context);
	rightPlayer.draw(context);
	gameBall.draw(context);

};


// After a goal, bring the ball back to the middle
function centerBall(ball) {
	ball.x = canvas.width / 2;
	ball.y = Math.floor(Math.random() * (canvas.height-ball.radius+1) + ball.radius);
	updateBallLocation();
}

let handleBallCollision = (ball, leftPaddle, rightPaddle) => {
	
	// Check if colliding with paddles
	collidingWithPlayerCheck(ball, leftPaddle, rightPaddle);

	// if colliding with wall bounce
	if (ball.x + ball.radius + BALL_SPEED > canvas.width) ball.xSpeed = -BALL_SPEED;
	if (ball.x - ball.radius - BALL_SPEED < 0) ball.xSpeed = BALL_SPEED;
	if (ball.y + ball.radius + BALL_SPEED > canvas.height) ball.ySpeed = -BALL_SPEED;
	if (ball.y - ball.radius - BALL_SPEED < 0) ball.ySpeed = BALL_SPEED;

	// check if colliding with back wall ie: a goal
	if(leftClaimed && rightClaimed){ // only track goals once both players have claimed a paddle
		if (ball.x + ball.radius + 8 > canvas.width && isLeftPlayer) {
			if ( rightClaimed) { // Let only the right player emit goal (that way both dont ping server)
				socket.emit('leftGoal');
				centerBall(ball);
			}

		} else if (ball.x - ball.radius - 8 < 0 && isRightPlayer) {
			if (leftClaimed) { // Let only the left player emit goal (that way both dont ping server)
				socket.emit('rightGoal');
				centerBall(ball);
			}
		}
	}

}

let collidingWithPlayerCheck = (ball, leftPaddle, rightPaddle) => {

	// If colliding with left player bounce
	if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
		ball.y + ball.radius > leftPaddle.y &&
		ball.y - ball.radius < leftPaddle.y + leftPaddle.height) {
		ball.x += BALL_SPEED;
		ball.xSpeed = BALL_SPEED;
		if (isLeftPlayer) updateBallLocation();
	}
	// If colliding with right player bounce
	else if (
		ball.x + ball.radius > rightPaddle.x &&
		ball.y + ball.radius > rightPaddle.y &&
		ball.y - ball.radius < rightPaddle.y + rightPaddle.height) {
		ball.x -= BALL_SPEED;
		ball.xSpeed = -BALL_SPEED;
		if (isRightPlayer) updateBallLocation();
	}

}

function movePaddle(player) {
	const dXY = 5; //amount to move paddle
	
	// if up arrow is pressed and in bounds move.
	if (keysPressed[UP_ARROW] && player.y - dXY >= 0) {
		player.y -= dXY;
		updateLocation(player);

	}
	// if down arrow is pressed and in bounds move.
	if (keysPressed[DOWN_ARROW] && player.y + player.height + dXY <= canvas.height) {
		player.y += dXY;
		updateLocation(player);

	}
}

// This function is called each frame
function update() {
	if (isLeftPlayer) {
		movePaddle(leftPlayer);
	}
	if (isRightPlayer) {
		movePaddle(rightPlayer);
	}
	handleBallCollision(gameBall, leftPlayer, rightPlayer);
	drawCanvas();
}

$(window).keyup((e) => {
	// if up arrow or down arrow is released, make its value in keypressed false
	if (e.which == UP_ARROW || e.which == DOWN_ARROW) {
		keysPressed[e.which] = false;
	}
});

$(window).keydown((e) => {
	// if up arrow or down arrow is pressed, make its value in keypressed true
	if (e.which == UP_ARROW || e.which == DOWN_ARROW) {
		keysPressed[e.which] = true;
	}
});


//SOCKET IO //

// Only the first client is responsible for sending this.
// It updates the ball location for anyone new joining the game
socket.on('sendMeWhereBallIs', function () {
	updateBallLocation();
});

// When an update of ball location is given, apply it.
socket.on('updateBall', function (newPuckLocation) {
	let location = JSON.parse(newPuckLocation);

	gameBall.x = location.x;
	gameBall.y = location.y;
	gameBall.xSpeed = location.xSpeed;
	gameBall.ySpeed = location.ySpeed;
});

/////// When paddle locations are given, apply them
socket.on('leftPlayerUpdate', (data) => {
	leftPlayer.y = JSON.parse(data).y;
});
socket.on('rightPlayerUpdate', (data) => {
	rightPlayer.y = JSON.parse(data).y;
});
////////

////// When the server says a paddle is claimed, reflect that in the canvas
socket.on('rightPlayerClaimed', (data) => {
	rightClaimed = JSON.parse(data).claimed;
	if(isLeftPlayer && data == rightClaimed){
		// Do nothing. End function.
	}
	else if(!isRightPlayer) $("#btnRight").prop('disabled', leftClaimed);
});

socket.on('leftPlayerClaimed', (data) => {
	leftClaimed = JSON.parse(data).claimed;
	if(isRightPlayer && data == leftClaimed){
		// Do nothing. End function
	}
	else if(!isLeftPlayer) $("#btnLeft").prop('disabled', leftClaimed);
});
////////

// Message recieved when the server hears a goal is scored by the left paddle
socket.on('leftGoal', (score) => {
	
	leftScore = JSON.parse(score).score;
	ballActive = false;
	gameBall.xSpeed = -BALL_SPEED;
	
	// Disable the ball for 1500ms
	setTimeout(function(){
		ballActive = true;
	},1500);
	
	$("#leftScore").html(leftScore.toString());
});

// Message recieved when the server hears a goal is scored by the left paddle
socket.on('rightGoal', (score) => {
	rightScore = JSON.parse(score).score;
	ballActive = false;
	gameBall.xSpeed = BALL_SPEED;

	// Disable the ball for 1500ms
	setTimeout(function(){
		ballActive = true;
		console.log("done");
	},1500);

	$("#rightScore").html(rightScore.toString());
});

// When a new player joins, have the paddle owners send their location
socket.on('newPlayerJoined', (data)=>{
	if(isLeftPlayer) updateLocation(leftPlayer);
	if(isRightPlayer) updateLocation(rightPlayer);
});

// Function to update the location of claimed paddles to the server
function updateLocation(player) {
	let yPos = {
		y: player.y
	};
	if (isLeftPlayer) socket.emit('leftPlayerUpdate', JSON.stringify(yPos));
	if (isRightPlayer) socket.emit('rightPlayerUpdate', JSON.stringify(yPos));
}

// Sends the sever the ball location
function updateBallLocation() {
	let responseData = {
		x: gameBall.x,
		y: gameBall.y,
		xSpeed: gameBall.xSpeed,
		ySpeed: gameBall.ySpeed
	};
	
	socket.emit('ballLocation', JSON.stringify(responseData));
}

// Called when page loads
$(document).ready(function () {

	do{
		name = prompt("INSTRUCTIONS\n"+
					  "Click a button to claim control of a paddle.\n"+
					  "Use the arrow keys to move the paddle up and down.\n"+
					  "Click the button again to relieve control.\n"+
					  "Game starts once both paddles are claimed.\n\n"+
					 "PLEASE ENTER YOUR NAME TO START");
	}while(!name);

	timer = setInterval(update, 10); //
	socket.emit('init');
});

//closex
