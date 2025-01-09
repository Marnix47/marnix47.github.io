class Hydrophone {
    position; //p5.Vector, positie
    memory; //van klasse signalMemory
    display;
    constructor(x, y){
        this.position = createVector(x,y);
        this.memory = new SignalMemory();
    }

    update(){
        // console.log(golf.calcDisplacementAtPoint(this.position));
        this.memory.update(golf.calcDisplacementAtPoint(this.position));
    }
    draw(){
        circle(this.position.x, this.position.y, 20);
    }
}