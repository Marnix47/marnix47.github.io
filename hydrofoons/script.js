//scale x10 -> 1 px was 1m, 1px wordt 10cm

var golf;
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
    // console.log(p5);
    createCanvas(1920, 1080);
    golf = new Wave(0, 0, Math.PI/4, 10, 0.02);
    interval = setInterval(runSetup, 4);
    delayObject = new Delay();
    // hydrofoon1 = new Hydrophone(40,40);
    // hydrofoon2 = new Hydrophone(80,40);
    for(var i = 0; i < 4; i++){
        hydrophones.push(new Hydrophone(10 * (i + 1), 40, i));
    }
    // hydrofoon1.totalMemory.addWave(golf);
    hydrophones.forEach(x => x.totalMemory.addWave(golf));
    // let newWave = new Wave(0,0, Math.PI/4, 10, 0.5);
    // waves.push(newWave);
    // hydrophones.forEach(x => x.totalMemory.addWave(newWave));

    graphPanel = new GraphPanel;

    // this.roughSlider = createSlider(0, 200, 0, 1);
    // // bigSlider.style("width", 200);
    // this.roughSlider.size(200);
    // this.roughSlider.position(50, 200);
    // this.preciseSlider = createSlider(-10, 10, 0, 0.05);
    // // bigSlider.style("width", 200);
    // this.preciseSlider.size(200);
    // this.preciseSlider.position(50, 250);
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
    //bereken de delay op basis van de grote en precieze slider:
    // delayObject.delay = bigSlider.value()/1000 + preciseSlider.value()/1000;
    delayObject.update();
    if(frameCount % 10 == 0){
        let newWave = new Wave(0,0, Math.PI/4, 10, 0.02);
        waves.push(newWave);
        hydrophones.forEach(x => x.totalMemory.addWave(newWave));
        // console.log(hydrophones[0].totalMemory.entries);
    }
    // console.log(!!waves[0]);
    // if(waves[0] && waves[0].frontPosition.x > 50 && waves[0].frontPosition.y > 50){
    //     console.error("removed");
    //     waves.shift();
    //     // hydrophones.forEach(x => {
    //     //     x.totalMemory.removeWave();
    //     // })
    // }
    // console.log(waves);
    // console.log(waves.length);
    // if(waves[0]) console.log(waves[0].frontPosition.x, waves[0].frontPosition.y);
    
    // console.log(hydrophones[0].totalMemory.entries.length);


    // if(!audioIsAllowedToRun()) return;
    background(255);
    // hydrofoon1.draw();
    // hydrofoon2.draw();
    golf.draw();
    // 
    hydrophones.forEach(x => {
        x.draw();
        x.renderBuffer();
    })

    waves.forEach(x => x.draw())

    graphPanel.drawTotalGraph();
    delayObject.drawSliderDialogue();
    // console.log(hydrofoon.memory.getShiftedAmountOfValues(10));

    
    
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
        golf.move(0.001);
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

