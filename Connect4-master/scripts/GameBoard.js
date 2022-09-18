console.log("GameBoard.js: loaded");


var bombSound = new Audio('bombSound.wav');
var p1Sound = new Audio('player1.wav');
var p2Sound = new Audio('player2.wav');
var boardSpill = new Audio('boardSpill.wav');

function sleep(ms) {
  let currentTime = Date.now()
  while(currentTime + ms > Date.now()) {}
}

function GameBoard (canvas) {
	
	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	this.state = new GameState(7, 6);
	this.winner = 0;
	this.bombInventories = [3,3];
}

function areInventoriesEmpty(inventories){
	return inventories[0] == 0 && inventories[1] == 0;
}



GameBoard.prototype.handleMouseDown = function (event) {

	
	if (this.winner == 1 || this.winner == 2 || (this.winner == -1 && areInventoriesEmpty(this.bombInventories))) {
		
		this.winner = 0;
		this.state = new GameState(7, 6);
		this.bombInventories = [3,3]
		this.draw();
		return;
	}
	var widthPerSpace = this.width / this.state.width;
	var spaceNum = Math.floor(event.offsetX / widthPerSpace);
	if (spaceNum >= this.state.width) {
		return;
	}
	
	
	if (event.button == 0 && this.state.addPieceToColumn(spaceNum)) {
		this.state.turn = (this.state.turn == 1 ? 2 : 1);
		this.winner = this.state.checkWinner();
		this.draw();
		
		if(this.state.turn == 1){
			p1Sound.currentTime = 0;
			p1Sound.play();
		}
		else{
			p2Sound.currentTime = 0;
			p2Sound.play();
		}
	}
	

	if (this.bombInventories[this.state.turn - 1] > 0 && event.button == 2 && this.state.removePieceFromColumn(spaceNum)){
		
		if (bombSound.currentTime > 0){
			bombSound.currentTime = 0;
		}
		bombSound.play();
		this.bombInventories[this.state.turn - 1]--;
		this.winner = this.state.checkWinner();
		this.draw();
	}
	
	document.getElementById("inv").innerHTML = "Player " + String(this.state.turn) + "'s Turn<br>";
	document.getElementById("inv").innerHTML += "&#128163".repeat(this.bombInventories[this.state.turn-1]) + "&#8205;";
	
	if (this.state.turn == 1){
		document.getElementById("inv").style.color = "#3671D1";
	}
	else if (this.state.turn == 2){
		document.getElementById("inv").style.color = "#D13671";
	}
}

GameBoard.prototype.handleMouseUp = function (event) {
}

GameBoard.prototype.handleMouseMove = function (event) {
}

GameBoard.prototype.draw = function () {
	var context = this.canvas.getContext('2d');
	
	document.getElementById("inv").innerHTML = "Player 1's Turn<br>&#128163&#128163&#128163&#8205;";
	document.getElementById("inv").style.color = "#3671D1";

	// draw background gradient
	var bggradient = context.createRadialGradient(this.width / 2,
												  this.height / 2,
												  0, this.width / 2,
												  this.height / 2, 600);
	bggradient.addColorStop(0, '#FFF');
	bggradient.addColorStop(1, '#FFFFFF');

	context.fillStyle = bggradient;
	context.fillRect(0, 0, this.width, this.height);

	var widthPerSpace = this.width / this.state.width;
	var heightPerSpace = this.height / this.state.height;
	

	// draw separators between squares
	context.strokeStyle = '#000';
	context.lineWidth = 3;
	for (var x = 1; x < this.state.width; x++) {
		var xcoord = Math.floor(widthPerSpace * x) + 0.5;
		context.beginPath();
		context.moveTo(xcoord, 0);
		context.lineTo(xcoord, this.height);
		context.stroke();
	}
	for (var y = 1; y < this.state.height; y++) {
		var ycoord = Math.floor(heightPerSpace * y) + 0.5;
		context.beginPath();
		context.moveTo(0, ycoord);
		context.lineTo(this.width, ycoord);
		context.stroke();
	}

	// draw individual pieces
	for (var y = 0; y < this.state.height; y++) {
		for (var x = 0; x < this.state.width; x++) {
			var xcoord = Math.round(x * widthPerSpace);
			var ycoord = Math.round(y * heightPerSpace);
			var kind = this.state.getPiece(x, y);
			var piece = new GamePiece(this, widthPerSpace, heightPerSpace, kind);
			context.save();
			context.translate(xcoord, ycoord);
			piece.draw();
			context.restore();
		}
	}
	
	
	if (this.winner == 1 || this.winner == 2 || (this.winner == -1 && areInventoriesEmpty(this.bombInventories))) {
		
		boardSpill.play();
		context.save();
		var text = 'Player 1 Wins!';
		if (this.winner == 2) text = 'Player 2 Wins!';
		if (this.winner == -1) text = 'Draw!';
		var dialog = new WinnerDialog(this.canvas, text);
		dialog.draw();
		context.restore();
	}

}

