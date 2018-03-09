'use strict';

var timer; //used to control the free moving word

var canvas = document.getElementById("canvas1"); //our drawing canvas
//var fontPointSize = 18; //point size for word text
//var editorFont = "Arial"; //font for your editor

let leftScore = 0,
	rightScore = 0;
let leftPlayer = new Player(5, 100, 10, 100);
let rightPlayer = new Player(canvas.width - 15, 100, 10, 100);

let isLeftPlayer = false,
	isRightPlayer = false;

let leftClaimed = false,
	rightClaimed = false;

let BALL_SPEED = 4;
let ballActive = true;

let gameBall = new Ball(300, 150, 10,BALL_SPEED);

let name;



$("#btnRight").click(function () {
	if (!isLeftPlayer && !isRightPlayer) {
		isRightPlayer = true;
		$("#btnLeft").prop('disabled', true);
		$("#btnRight").html(name);
		rightPlayer.toggleOwnerShip();
		socket.emit('claimPlayerRight',true);
		return;
	}
	if(isRightPlayer){
		isRightPlayer = false;
		if(leftClaimed == false){
			$("#btnLeft").prop('disabled', false);
		}
		$("#btnRight").html("Join");
		rightPlayer.toggleOwnerShip();
		socket.emit('claimPlayerRight',false);
	}
});

$("#btnLeft").click(function () {
	if (!isRightPlayer && !isLeftPlayer) {
		isLeftPlayer = true;
		$("#btnRight").prop('disabled', true);
		$("#btnLeft").html(name);
		leftPlayer.toggleOwnership();
		socket.emit('claimPlayerLeft',true);
		return;
	}
	if(isLeftPlayer){
		isLeftPlayer = false;
		if(rightClaimed == false){
			$("#btnRight").prop('disabled', false);
		}
		$("#btnLeft").html("Join");
		leftPlayer.toggleOwnership();
		socket.emit('claimPlayerLeft',false);
	}
});


function Player(x, y, width, height, id) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.id = id;
	this.colour = "#ff1744";
	this.draw = function (context) {
		context.beginPath();
		context.lineWidth=5;
		context.strokeStyle = this.colour;
		context.strokeRect(this.x, this.y, this.width, this.height);
		context.stroke();
		context.closePath();
	}
	
	this.toggleOwnership = function(){
		console.log("colour = " + this.colour);
		if(this.colour == "#ff1744"){
			this.colour = "#00e676";
		}
		else{
			this.colour = "#ff1744";
		}
	}
}

function Ball(x, y, radius, speed) {
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.xSpeed = speed;
	this.ySpeed = speed;

	this.checkCollision = function () {
		console.log(this.y);
		if (this.x + this.radius + BALL_SPEED > canvas.width) this.xSpeed = -BALL_SPEED;
		if (this.x - this.radius - BALL_SPEED < 0) this.xSpeed = BALL_SPEED;
		if (this.y + this.radius + BALL_SPEED > canvas.height) this.ySpeed = -BALL_SPEED;
		if (this.y - this.radius - BALL_SPEED < 0) this.ySpeed = BALL_SPEED;
	}

	this.draw = function (context) {

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

	//context.font = "" + fontPointSize + "pt " + editorFont;

	//	puck.stringWidth = context.measureText(puck.word).width;
	//	context.fillText(puck.word, puck.x, puck.y);
	//draw moving box
	leftPlayer.draw(context);
	rightPlayer.draw(context);
	gameBall.draw(context);

};


function centerBall(ball) {
	ball.x = canvas.width / 2;
	ball.y = Math.floor(Math.random() * (canvas.height-ball.radius+1) + ball.radius);
	updateBallLocation();


}

let handleBallCollision = (ball, leftPaddle, rightPaddle) => {
	// Check if colliding with paddles
	collidingWithPlayerCheck(ball, leftPaddle, rightPaddle);

	// if colliding with wall
	if (ball.x + ball.radius + BALL_SPEED > canvas.width) ball.xSpeed = -BALL_SPEED;
	if (ball.x - ball.radius - BALL_SPEED < 0) ball.xSpeed = BALL_SPEED;
	if (ball.y + ball.radius + BALL_SPEED > canvas.height) ball.ySpeed = -BALL_SPEED;
	if (ball.y - ball.radius - BALL_SPEED < 0) ball.ySpeed = BALL_SPEED;

	// check if colliding with back wall ie: a goal
	if(leftClaimed && rightClaimed){
		if (ball.x + ball.radius + 8 > canvas.width && isLeftPlayer) {
			if ( rightClaimed || true) {
				socket.emit('leftGoal');
				centerBall(ball);
			}

		} else if (ball.x - ball.radius - 8 < 0 && isRightPlayer) {
			if (leftClaimed || true) {
				socket.emit('rightGoal');
				centerBall(ball);
			}
		}
	}

}

let collidingWithPlayerCheck = (ball, leftPaddle, rightPaddle) => {

	// If colliding with left player
	if (ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
		ball.y + ball.radius > leftPaddle.y &&
		ball.y - ball.radius < leftPaddle.y + leftPaddle.height) {
		ball.x += BALL_SPEED;
		ball.xSpeed = BALL_SPEED;
		if (isLeftPlayer) updateBallLocation();
	}
	// If colliding with right player
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
	const dXY = 5; //amount to move in both X and Y direction

	if (keysPressed[UP_ARROW] && player.y - dXY >= 0) {
		player.y -= dXY;
		updateLocation(player);

	}
	if (keysPressed[DOWN_ARROW] && player.y + player.height + dXY <= canvas.height) {

		player.y += dXY;
		updateLocation(player);

	}
}

function update() {
	if (isLeftPlayer) {
		movePaddle(leftPlayer);
	}
	if (isRightPlayer) {
		movePaddle(rightPlayer);
	}

	//movePaddle()

	handleBallCollision(gameBall, leftPlayer, rightPlayer);
	drawCanvas();
}

// keypress handling startx
//KEY CODES
//should clean up these hard coded key codes
const UP_ARROW = 38;
const DOWN_ARROW = 40;

let keysPressed = {};

$(window).keyup((e) => {
	if (e.which == UP_ARROW || e.which == DOWN_ARROW) {
		keysPressed[e.which] = false;
	}
});

$(window).keydown((e) => {
	if (e.which == UP_ARROW || e.which == DOWN_ARROW) {
		keysPressed[e.which] = true;
	}
});





//closex
//Socket I/O startx

var socket = io('http://' + window.document.location.host);

socket.on('serverSays', function (data) {

	movingBox = JSON.parse(data);
});

// Only the first client is responsible for sending this
socket.on('sendMeWherePuckIs', function () {
	updateBallLocation();
});

// Update clients puck
socket.on('updatePuck', function (newPuckLocation) {
	let location = JSON.parse(newPuckLocation);

	gameBall.x = location.x;
	gameBall.y = location.y;
	gameBall.xSpeed = location.xSpeed;
	gameBall.ySpeed = location.ySpeed;
});

socket.on('leftPlayerUpdate', (data) => {
	leftPlayer.y = JSON.parse(data).y;
});
socket.on('rightPlayerUpdate', (data) => {
	rightPlayer.y = JSON.parse(data).y;
});
socket.on('rightPlayerClaimed', (data) => {
	//rightClaimed = JSON.parse(data).claimed;
	rightClaimed = data;
	if(isLeftPlayer && data == false){

	}
	else if(!isRightPlayer) $("#btnRight").prop('disabled', data);
});
socket.on('leftPlayerClaimed', (data) => {
	//leftClaimed = JSON.parse(data).claimed;
	leftClaimed = data;
	if(isRightPlayer && data == false){

	}
	else if(!isLeftPlayer) $("#btnLeft").prop('disabled', data);
});

socket.on('leftGoal', (score) => {

	leftScore = JSON.parse(score).score;
	console.log(leftScore)
	ballActive = false;
	gameBall.xSpeed = -BALL_SPEED;
	setTimeout(function(){
		ballActive = true;
		console.log("done");
	},1500);
	$("#leftScore").html(leftScore.toString());
});

socket.on('rightGoal', (score) => {
	rightScore = JSON.parse(score).score;
	ballActive = false;
	gameBall.xSpeed = BALL_SPEED;

	setTimeout(function(){
		ballActive = true;
		console.log("done");
	},1500);


	$("#rightScore").html(rightScore.toString());
});

function updateLocation(player) {
	let yPos = {
		y: player.y
	};
	if (isLeftPlayer) socket.emit('leftPlayerUpdate', JSON.stringify(yPos));
	if (isRightPlayer) socket.emit('rightPlayerUpdate', JSON.stringify(yPos));
}

function updateBallLocation() {
	let responseData = {
		x: gameBall.x,
		y: gameBall.y,
		xSpeed: gameBall.xSpeed,
		ySpeed: gameBall.ySpeed
	};

	//JSON.stringify(puck);
	console.log(JSON.stringify(responseData));
	socket.emit('puckLocation', JSON.stringify(responseData));
}

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
