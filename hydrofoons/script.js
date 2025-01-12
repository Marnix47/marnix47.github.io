//scale x10 -> 1 px was 1m, 1px wordt 10cm
const scale = 100;

var interval;
var hydrofoon1;
var hydrofoon2;
var hydrophones = [];
var graphPanel;
var waves = [];
var delayObject;
var sound;
var confirmButton;
// var soundFrameWindow;
var lastInterval = performance.now();
const soundChannel = new BroadcastChannel("sound-channel");

var soundUpdateInterval;

var frameStart = performance.now();

function setup(){
    createCanvas(1920, 1080);
    interval = setInterval(runSetup, 4);
    delayObject = new Delay();
    graphPanel = new GraphPanel();
    sound = new Sound();
    soundUpdateInterval = setInterval(updateSound, 500);
    confirmButton = createButton("Geluid aanzetten");
    confirmButton.position(width/2, height/2);
    confirmButton.mousePressed(function(){
        if(sound.context.state !== "suspended"){
            confirmButton.label = "Geluid aanzetten";
            sound.context.suspend();
        } else {
            confirmButton.label = "Geluid uitzetten";
            sound.context.resume();
        }
    });
    for(var i = 0; i < 6; i++){
        hydrophones.push(new Hydrophone(1 * (i + 1), 2, i));
    }

    // soundFrameWindow = document.querySelector("iframe").contentWindow;


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

function updateSound(){
    console.log(performance.now() - lastInterval);
    lastInterval = performance.now();
    //array genereren...
    var values = new Array(sound.sampleRate/2).fill(0);
    // for(var t = 0; t < sound.requiredArrayLength500ms; t++){

    // }
    if(!audioIsAllowedToRun()){

    }

    hydrophones.forEach(x => {
        x.totalMemory.entries.forEach(entry => {
            for(var t = 0; t < sound.sampleRate/2; t++){
                values[t] += entry.displacement((frameStart - t * 500 / sound.sampleRate)/500 , delayObject.delay * x.index, false);
            }
        })
    })
    values.map(x => x/hydrophones.length);
    //max. amplitude voor de functie is 1, die was eerst 6
    // sound.playArray1000ms(values);
    // soundFrameWindow.postMessage(values);
    soundChannel.postMessage(values);

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

