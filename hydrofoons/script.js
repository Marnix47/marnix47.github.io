var golf;
var interval;
var hydrofoon1;
var hydrofoon2;
function setup(){
    createCanvas(1920, 1080);
    golf = new Wave(0, 0, Math.PI/4, 10, 0.1, 2);
    interval = setInterval(runSetup, 4);
    hydrofoon1 = new Hydrophone(40,40);
    hydrofoon2 = new Hydrophone(80,40);
}

function draw(){
    background(255);
    hydrofoon1.draw();
    hydrofoon2.draw();
    golf.draw();
    // console.log(hydrofoon.memory.getShiftedAmountOfValues(10));
    
}

function runSetup(){
    for(var i = 0; i < 4; i++){
        hydrofoon1.update();
        hydrofoon2.update();
        golf.move(0.001);
    }
}