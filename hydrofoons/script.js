var golf;
var interval;
var hydrofoon1;
var hydrofoon2;
// var osc;
// const osc = new window.p5.Oscillator()
var osci = new p5.Oscillator(100);
osci.amp(0)
var osci2 = new p5.Oscillator(100);
osci2.amp(0)
function setup(){
    console.log(p5);
    createCanvas(1920, 1080);
    golf = new Wave(0, 0, Math.PI/4, 10, 0.1, 2);
    // interval = setInterval(runSetup, 4);
    hydrofoon1 = new Hydrophone(40,40);
    hydrofoon2 = new Hydrophone(80,40);
    hydrofoon1.totalMemory.addWave(golf);
    // osc = new p5.Oscillator();
    // osc.amp(.05);
    // osc.freq(100);
    // osc2 = new p5.Oscillator(100);
    // osc2.amp(0.05);
    // osc2.start();
    // osc.start();

}

function draw(){
    // if(!audioIsAllowedToRun()) return;
    background(255);
    hydrofoon1.draw();
    hydrofoon2.draw();
    golf.draw();
    hydrofoon1.renderBuffer();
    // console.log(hydrofoon.memory.getShiftedAmountOfValues(10));

    
    
}

// function mousePressed(){
//     osci.start();
//     osci2.start();
//     console.log("pressed");
// }

function runSetup(){
    for(var i = 0; i < 4; i++){
        hydrofoon1.update();
        hydrofoon2.update();
        golf.move(0.001);
    }
}


//gemaakt met AI: https://www.phind.com/search?cache=yoguz9uof5r6euu1r3ldm9ko
function audioIsAllowedToRun() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    return audioCtx.state === 'running' || audioCtx.state === 'suspended';
}

let id_count = 0;
function getNewId(){
    id_count++;
    return id_count;
}


// window.onload = function(){
//     document.getElementsByTagName("body")[0].addEventListener("click", (event) => {
//         var os = new p5.Oscillator();
//         os.freq(100);
//         os.amp(.05);
//         os.start();
//         osci.start();
//         // console.log("clicked");
//     })
// }

