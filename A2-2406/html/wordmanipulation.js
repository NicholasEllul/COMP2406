	/*
Made by Nicholas Ellul - 101064168 and Peter Khlopenkov - 101072312
Made for COMP 2406 Assignment 1

This JS file was based on tutorial 2.
It requests an array of song lyrics where each element is a line of the song.
This file strips the words and writes them to the screen.

Use javascript array of objects to represent words and their locations
*/

let words = [];
let chords = [];
let timer;

let wordBeingMoved;

let deltaX, deltaY; //location where mouse is pressed
let canvas = document.getElementById('canvas1'); //our drawing canvas

function getWordAtLocation(aCanvasX, aCanvasY){
    // This function loops though all the movable text, and returns the one thats being clicked

    let context = canvas.getContext('2d');
    context.font = '15pt Arial';

    for(let i=0; i<words.length; i++){
        let wordWidth = context.measureText(words[i].word).width;
        if(Math.abs(words[i].x + wordWidth/2 - aCanvasX) < wordWidth/2 &&
           Math.abs(words[i].y - 15/2 - aCanvasY) < 15/2)
        {
            return words[i];
        }
    }
    return null;
}

let drawCanvas = function(){

    let context = canvas.getContext('2d');

    context.fillStyle = 'white';
    context.fillRect(0,0,canvas.width,canvas.height); //erase canvas

    context.font = '15pt Arial';
    context.fillStyle = 'black';

    for(let i=0; i<words.length; i++){  //note i declared as let

        let data = words[i];
        context.fillText(data.word, data.x, data.y);

    }
}

function handleMouseDown(e){

    //get mouse location relative to canvas top left
    let rect = canvas.getBoundingClientRect();
    //let canvasX = e.clientX - rect.left;
    //let canvasY = e.clientY - rect.top;
    let canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
    let canvasY = e.pageY - rect.top;
    console.log("mouse down:" + canvasX + ", " + canvasY);

    wordBeingMoved = getWordAtLocation(canvasX, canvasY);
    //console.log(wordBeingMoved.word);
    if(wordBeingMoved != null ){
        deltaX = wordBeingMoved.x - canvasX;
        deltaY = wordBeingMoved.y - canvasY;
        //document.addEventListener("mousemove", handleMouseMove, true);
        //document.addEventListener("mouseup", handleMouseUp, true);
        $("#canvas1").mousemove(handleMouseMove);
        $("#canvas1").mouseup(handleMouseUp);

    }

    // Stop propagation of the event and stop any default
    //  browser action

    e.stopPropagation();
    e.preventDefault();

    drawCanvas();
}

function handleMouseMove(e){

    console.log("mouse move");

    //get mouse location relative to canvas top left
    let rect = canvas.getBoundingClientRect();
    let canvasX = e.pageX - rect.left;
    let canvasY = e.pageY - rect.top;

    wordBeingMoved.x = canvasX + deltaX;
    wordBeingMoved.y = canvasY + deltaY;

    e.stopPropagation();

    drawCanvas();
}

function handleMouseUp(e){
    console.log("mouse up");

    e.stopPropagation();

    //remove mouse move and mouse up handlers but leave mouse down handler
    $("#canvas1").off("mousemove", handleMouseMove); //remove mouse move handler
    $("#canvas1").off("mouseup", handleMouseUp); //remove mouse up handler

    drawCanvas(); //redraw the canvas
}



//KEY CODES
let ENTER = 13;

function handleKeyUp(e){
    console.log("key UP: " + e.which);

    if(e.which == ENTER){
        handleSubmitButton(); //treat ENTER key like you would a submit
        $('#userTextField').val(''); //clear the user text field
    }

    e.stopPropagation();
    e.preventDefault();
}

function handleSubmitButton () {

    let userText = $('#userTextField').val(); //get text from user text input field

    if(userText && userText != ''){
        //user text was not empty

        // Reset on screen text
        let textDiv = document.getElementById("text-area");
        textDiv.innerHTML =  `<p> </p>`
        words = [];

        let userRequestObj = {text: userText}; //make object to send to server
        let userRequestJSON = JSON.stringify(userRequestObj); //make json string
        $('#userTextField').val(''); //clear the user text field

        $.post("userText", userRequestJSON, function(data, status){            

            console.log("data: " + data);
            console.log("typeof: " + typeof data);

            let context = canvas.getContext('2d');
            let responseObj = JSON.parse(data);
            
            let yValue = 30;
            for(let line of responseObj.lyricsArray){
                let xValue = 20;

                //Write the line of lyrics beneath the search box
                textDiv.innerHTML = textDiv.innerHTML + `<p> ${line}</p>`

                // Dont bother wasting time on an empty line.
                if(line.length === 0) continue;

                let wordsInLine = line.split(/\s/);


                // Iterate over each word in the line
                for(aWord of wordsInLine){
                    let chordsInThisWord = 0;
                    let widthChordsNeed = 0;

                    // Strip the words of their embedded chords and add them to the array to be drawn
                    while (aWord.indexOf('[') > -1){
                        chordsInThisWord += 1;

                        let chord = '';
                        let indexOfChord = aWord.indexOf('[');

                        // Strip out the chord from the word
                        chord = aWord.substring(indexOfChord,aWord.indexOf(']')+1);
                        aWord = aWord.replace(/\b\[.+?\]|\[.+?\]\b|\[.+?\]/, '');

                        // Offset to center the chord over the point in the word it should be played 
                        let xOffset = (indexOfChord * context.measureText(aWord.substring(0,indexOfChord)).width /
                                       (indexOfChord + 1)) - context.measureText(chord).width /2;

                        let chordWidth = context.measureText(chord).width;
                        widthChordsNeed += chordWidth;

                        // Offset the chord spacing if there are multiple chords so that they dont bunch up 
                        if(chordsInThisWord > 1) xOffset += chordWidth * (chordsInThisWord - 1);

                        words.push({word:chord, x:xValue+xOffset, y:yValue-25});
                    }
					if(aWord != ""){
					  words.push({word: aWord, x:xValue, y:yValue});	
					}
                    // Calculate spacing after word
                    xValue += 10 + context.measureText(aWord).width;
                    if(chordsInThisWord > 1) xValue += widthChordsNeed/2 + 10;
                }
                yValue += 50;
            }
        });
    }

}

function handleRefreshButton() {
    //refreshes paragraph text to match canvas

    //this will store all the new lines to print
    let newLines = [];

    //copy words into tempWords to use for this function in order to not mess with other uses of words
    let tempWords = words.slice(0);

    //if a word is within this offset it will be counted as part of the line
    const offset = 10;
    const chordOffset = 25; //chords have extra offset since they are pulled from higher than line

    //the map function will return an array of the words' y values
    //the Math.max function will get the max from that array
    //this will track the y value to compare all words to determine if part of
    let currentLineY = Math.max(...tempWords.map(function(word){return word.y;})); //starts at highest word (in terms of y value)

    while(currentLineY > 0) {
        let newLine = "";
        let wordsInLine = [];

        for (let i = 0; i < tempWords.length; i++) {
            if (tempWords[i].word.startsWith("[")) { //if this is a chord use chord offset
                if (tempWords[i].y >= currentLineY - chordOffset) { //if word within offset add to line
                    wordsInLine.push(tempWords[i]);
                }
            } else {
                if (tempWords[i].y >= currentLineY - offset) { //if word within offset add to line
                   wordsInLine.push(tempWords[i]);
                }
            }
        }

        //sort wordsInLine by their x value
        wordsInLine.sort(function (a, b) {
            return a.x - b.x;
        });

        //arrange all the wordsInLine into string
        for (let i = 0; i < wordsInLine.length; i++) {
            newLine += wordsInLine[i].word;
            newLine += " ";
            tempWords.splice(tempWords.indexOf(wordsInLine[i]),1); //remove from tempWords since it is being printed
        }

        newLines.unshift(newLine); //add new line to start of all lines

        //update current line y to y value of highest word that hasnt been printed
        currentLineY = Math.max(...tempWords.map(function (word) {return word.y;}));
    }

    // Reset on screen text
    let textDiv = document.getElementById("text-area");
    textDiv.innerHTML =  `<p> </p>`

    //write new lines to textDiv
    for(let line of newLines) {
        textDiv.innerHTML = textDiv.innerHTML + `<p> ${line}</p>`
    }

    return null;
}

function handleSaveAsButton() {

    let save = true; //boolean to distinguish this as a save request
    let songText = document.getElementById("text-area").innerText; //get song text from div
    let userText = $('#userTextField').val(); //get text from user text input field

    let userRequestObj = {newSong: songText, text: userText, save: save};
    let userRequestJSON = JSON.stringify(userRequestObj); //make json string

    $.post("newSong", userRequestJSON); //send a save request to server
}

$(document).ready(function(){
    //This is called after the browser has loaded the web page

    //add mouse down listener to our canvas object
    $("#canvas1").mousedown(handleMouseDown);

    //add key handler for the document as a whole, not separate elements.

    $(document).keyup(handleKeyUp);

    timer = setInterval(drawCanvas, 0);
    //timer.clearInterval(); //to stop

    drawCanvas();
});
