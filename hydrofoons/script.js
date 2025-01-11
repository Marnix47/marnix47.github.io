//scale x10 -> 1 px was 1m, 1px wordt 10cm
const scale = 100;

var interval;
var hydrofoon1;
var hydrofoon2;
var hydrophones = [];
var graphPanel;
var waves = [];
var delayObject;

var frameStart = performance.now();
// var osc;
// const osc = new window.p5.Oscillator()
var osci = new p5.Oscillator(100);
osci.amp(0)
var osci2 = new p5.Oscillator(100);
osci2.amp(0)
function setup(){
    createCanvas(1920, 1080);
    interval = setInterval(runSetup, 4);
    delayObject = new Delay();
    graphPanel = new GraphPanel();
    for(var i = 0; i < 6; i++){
        hydrophones.push(new Hydrophone(1 * (i + 1), 2, i));
    }

    // osc = new p5.Oscillator();
    // osc.amp(.05);
    // osc.freq(100);
    // osc2 = new p5.Oscillator(100);
    // osc2.amp(0.05);
    // osc2.start();
    // osc.start();

}

function draw(){
    //elke berekening binnen een frame moet uitgaan van dezelfde starttijd, anders ontstaan er kleine afwijkingen.
    frameStart = performance.now();

    delayObject.update();
    if(frameCount % 30 == 0){
        let newWave = new Wave(0,0, delayObject.parseAngleSlider() * Math.PI/180, 10, 0.02);
        waves.push(newWave);
        hydrophones.forEach(x => x.totalMemory.addWave(newWave));
    }
    background(255);
    hydrophones.forEach(x => {
        x.draw();
        x.renderBuffer();
    })
    waves.forEach(x => x.draw())
    delayObject.drawSliderDialogues();
    graphPanel.draw();

    
    
}

// function mousePressed(){
//     osci.start();
//     osci2.start();
//     console.log("pressed");
// }

function runSetup(){
    for(var i = 0; i < 4; i++){
        // hydrofoon1.update();
        // hydrofoon2.update();
        // golf.move(0.001);
        waves.forEach(x => x.move(0.001));
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

