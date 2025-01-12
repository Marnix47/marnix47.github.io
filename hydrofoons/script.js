//scale x100 -> 1 px was 1m, 1px wordt 1cm
const scale = 100;
const amountOfHydrophones = 6;

var interval;
var hydrofoon1;
var hydrofoon2;
var hydrophones = [];
var graphPanel;
var waves = [];
var delayObject;
var angleVisualiser;
var sound;
var confirmButton;
var lastInterval = performance.now();
const soundChannel = new BroadcastChannel("sound-channel");
soundChannel.addEventListener("message", event => {
    if(event.data === "request"){
        soundChannel.postMessage(updateSound());
    }
})

var soundUpdateInterval;

var frameStart = performance.now();

function setup(){
    createCanvas(1920, 1080);
    interval = setInterval(runSetup, 4);
    delayObject = new Delay();
    graphPanel = new GraphPanel();
    sound = new Sound();
    angleVisualiser = new AngleVisualiser();
    soundUpdateInterval = setInterval(updateSound, 500);
    confirmButton = createButton("Geluid aanzetten");
    confirmButton.position(width/2, height/2);
    confirmButton.size(150, 30);
    confirmButton.position(graphPanel.leftX - 170, 10);

    confirmButton.mousePressed(function(){
        if(sound.context.state !== "suspended"){
            confirmButton.html("Geluid aanzetten")
            sound.context.suspend();
        } else {
            confirmButton.html("Geluid uitzetten");
            sound.context.resume();
        }
    });

    for(var i = 0; i < amountOfHydrophones; i++){
        hydrophones.push(new Hydrophone(1 * (i + 1), 2, i));
    }
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
    angleVisualiser.draw(delayObject.calcAngle(delayObject.delay));
    delayObject.drawSliderDialogues();
    graphPanel.draw();
    
}


function runSetup(){
    for(var i = 0; i < 4; i++){
        waves.forEach(x => x.move(0.001));
    }
}

function updateSound(){
    lastInterval = performance.now();
    //array genereren...
    var values = new Array(sound.sampleRate/2).fill(0);
    hydrophones.forEach(x => {
        x.totalMemory.entries.forEach(entry => {
            for(var t = 0; t < sound.sampleRate/2; t++){
                values[t] += entry.displacement((frameStart/1000 - t/4 / (sound.sampleRate/2)) , delayObject.delay * x.index, false);
            }
        })
    })
    values.map(x => (x/hydrophones.length) ** 2);
    //max. amplitude voor de functie 'playArray500ms' is 1, die is daar nu aan aangepast
    sound.playArray500ms(values);

}

