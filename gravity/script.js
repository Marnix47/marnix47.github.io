// const G = 6.67e-11;
var G = 50; //can be changed through slider
// const PI = Math.PI;
const dt = .001;

var iterationsPerFrame = 5e2 / (dt * 1000);

const Situation = parseInt(new URLSearchParams(document.location.search).get("s"));

var lastMousePressedCoord = {x: null, y: null};
var deviation = {x: 0, y: 0};
var dDeviation = {x: 0, y: 0};

var pointMasses;
var earthOrbit = [];
var slider;

let c;
var id = 0;
function assignId(){
    id++;
    return id
}

function setup(){
    // // console.log(getDistance({x:0, y:0}, {x:4, y:3}));
    // console.log(Math.atan((-1))/PI);
    // pointMasses = [
    //     // new PointMass(30, 1, {x:0,y:0}, {x:200, y: 540}),
    //     // new PointMass(30, 1, {x:0,y:0}, {x:800, y: 540})
        
       


    // ];
    // if(Situation == 1){
    //     pointMasses = [
    //         new PointMass(50, 1000, {x:0, y:0}, {x: 960, y:540}),
    //         new PointMass(30, 1, {x:0, y: 5 * Math.sqrt(5)}, {x: 560, y:540}),
    //     ]
    // } else if(Situation == 2){
    //     pointMasses = []
    //     new PointMass(30, 1, {x:0,y:0}, {x:800, y:540}),
    //     new PointMass(30, 1, {x:0,y:0}, {x:500, y:640}),
    //     new PointMass(30, 1, {x:0,y:0}, {x:200, y:540}),
    // }

    switch(Situation){
        case 1: 
            pointMasses = [
                new PointMass(50, 1000, {x:0, y:0}, {x: 960, y:540}),
                new PointMass(30, 1, {x:0, y: 5 * Math.sqrt(5)}, {x: 560, y:540}),
            ];
        break;
        case 2:
            pointMasses = [
                new PointMass(30, 1, {x:0,y:0}, {x:800, y:540}),
                new PointMass(30, 1, {x:0,y:0}, {x:500, y:640}),
                new PointMass(30, 1, {x:0,y:0}, {x:200, y:540}),
            ];
            iterationsPerFrame *= 10;
    }
    console.log(pointMasses)
    c = createCanvas(1920, 1080);
    slider = createSlider(10, 300, 50, 10);
    slider.position(1920 - 50, 50)
}

class PointMass{
    constructor(R, m, v0, p0){
        //Equator radius, mass, v0 = starting vector speed {x, y}, x0 = starting vector position {x, y}
        this.Radius = R;
        this.mass = m;
        // this.v = {x: v0.x, y: v0.y}
        // this.p = {x: p0.x, y: p0.y};
        // this.v = {x: v0x, y: v0y};
        // this.p = {x: p0x, y: p0y};
        this.a = {x: 0, y:0};
        this.v = v0;
        this.p = p0;
        this.po = p0;
        this.vo = v0;
        this.id = assignId();
        // console.log(v0 , p0)
        console.log({...this})
    }
    calcNewPosition(){
        var Fres = {x: 0, y: 0};
        for(m of pointMasses){
            if(this.p.x == m.px && this.p.y == m.py) continue;
            if(Math.abs(this.p.x - m.p.x) < 10 && Math.abs(this.p.y - m.p.y) < 10) continue;
            //var Fgx = G * m.mass * this.mass / ((Math.abs(m.px - this.px)) ** 2) * (this.px > m.px ? -1 : 1) //object to the left => x decreases
            //var Fgy = G * m.mass * this.mass / ((Math.abs(m.py - this.py)) ** 2) * (this.py > m.py ? -1 : 1) //object downwards => x decreases
            var Fgtot = G * m.mass * this.mass / (dist(this.p.x, this.p.y, m.p.x, m.p.y) ** 2);
            // console.log(dist(this.px, this.py, m.px, m.py));
            var phi = Math.atan((this.p.x - m.p.x) / (this.p.y - m.p.y));
            Fres.x += Fgtot * Math.abs(Math.sin(phi)) * (this.p.x - m.p.x > 0 ? -1 : 1);
            Fres.y += Fgtot * Math.abs(Math.cos(phi)) * (this.p.y - m.p.y > 0 ? -1 : 1);
        }
        var acc = {x: Fres.x/this.mass, y: Fres.y/this.mass}
        this.a = acc;
        // console.log("acc: ", acc)
        this.v.x += acc.x * dt;
        this.v.y += acc.y * dt;
        // this.po.x += (this.v.x - .5 * acc.x * dt) * dt;
        // this.po.y += (this.v.y - .5 * acc.y * dt) * dt;
        this.po.x += (this.v.x ) * dt;
        this.po.y += (this.v.y) * dt;
        
    }
    move(){
        this.p.x = this.po.x;
        this.p.y = this.po.y;
    }

    teken(){
        // fill("blue");
        // circle(this.px, this.py, this.Radius * 2)
        // if(frameCount< 6) console.log(this.px, this.py)
        fill("blue");
        circle(this.px, this.py, this.Radius * 2);
        rect(this.px, this.py, this.Radius, this.Radius)
        if(frameCount< 6) console.log(this.p.x, this.p.y);
        // console.log("drawing")
    }
}

function iterate(){
    for(m of pointMasses){
        m.calcNewPosition();
    }
    for(m of pointMasses){
        m.move();
    }
}

function draw(){
    G = slider.value();
    // console.log(slider.value())
    if(mouseIsPressed){
        if(lastMousePressedCoord.x == null){
            lastMousePressedCoord.x = mouseX;
            lastMousePressedCoord.y = mouseY;
            console.log("lastMousPressedCoord was ", null);
            console.log("Normal deviation was ", deviation);
        }
        lastMousePressedCoord = {...lastMousePressedCoord};
        dDeviation = {x: mouseX - lastMousePressedCoord.x, y: mouseY - lastMousePressedCoord.y};
    } else if(lastMousePressedCoord.x != null){
        console.log("dDev was ", dDeviation);
        lastMousePressedCoord = {x: null, y:null};
        deviation.x = deviation.x + dDeviation.x;
        deviation.y = deviation.y + dDeviation.y;
        dDeviation = {x: 0, y: 0};
    } else {

    }
    noStroke();
    clear();
    fill("blue")
    background("black")
    // if(frameCount < 6){
    //     var l = [];
    //     pointMasses.forEach(e => l.push({...e}));
    //     console.log(l)
    // }
    // for(m of pointMasses){
    //     if(frameCount < 6){
    //         console.log({...m});
    //     }
    //     m.move();
    //     m.draw();
    //     if(frameCount < 6){
    //         console.log({...m});
    //     }
    // }
    // fill("blue");
    // circle(0,0, 50);
    for(i = 0; i < iterationsPerFrame; i++){
        iterate();
    }
    for(m of pointMasses){
        if(true){
            // console.log("draw")
            fill("white");
            earthOrbit.push({...m.p});
            if(earthOrbit.length > 100000){
                earthOrbit.shift();
            }
            for(position of earthOrbit){
                circle(position.x + deviation.x + dDeviation.x, position.y + deviation.y + dDeviation.y, 3);
            }
        }
        m.teken();
        circle(m.p.x + deviation.x + dDeviation.x, m.p.y + deviation.y + dDeviation.y, 2 * m.Radius)
        stroke("red");
        strokeWeight(5);
        line(m.p.x + deviation.x + dDeviation.x, m.p.y + deviation.y + dDeviation.y, m.p.x + m.v.x * 15 + deviation.x + dDeviation.x, m.p.y + m.v.y * 15 + deviation.y + dDeviation.y);
        noStroke();
        strokeWeight(5);
        stroke("yellow");
        line(m.p.x + deviation.x + dDeviation.x, m.p.y + deviation.y + dDeviation.y, m.p.x + m.a.x * 150 + deviation.x + dDeviation.x, m.p.y + m.a.y * 150 + deviation.y + dDeviation.y)

        noStroke();
        
        
    }
    
    if(Situation == 1){
        if(frameCount == 300){
            pointMasses.push(new PointMass(10, 100, {x:2, y:-5}, {x:100, y:300}));
        }
    }
}

function getDistance(p1, p2){
    //p1 and p2 are position vectors: {x, y}
    if(frameCount < 5) {
        console.log(dist(p1.x, p1.y, p2.x, p2.y));
    }
    return dist(p1.x, p1.y, p2.x, p2.y);
    
}

