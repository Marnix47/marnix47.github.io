class Delay {
    delay; //[s]
    angle; //[rad]
    roughSlider; //p5.Element, HTML slider
    preciseSlider; //p5.Element, HTML slider
    constructor(){
        this.delay = 2;
        this.angle = this.calcAngle(this.delay);
        this.roughSlider = createSlider(0, 200, 0, 1);
        this.roughSlider.size(200);
        this.roughSlider.position(65, 790);
        this.preciseSlider = createSlider(-10, 10, 0, 0.05);
        this.preciseSlider.size(200);
        this.preciseSlider.position(65, 840);
    }

    calcAngle(delay /*[s]*/){
        // return .5 * Math.PI;
        return Math.asin(delay);
    }

    drawSliderDialogue(){
        noFill();
        strokeWeight(4);
        stroke("lightblue");
        rect(50, 750, 250, 180, 10, 10, 10, 10);
        strokeWeight(1);
        stroke(0);
        fill(0);
        textSize(17);
        text(`Ruwe Delay: ${(this.roughSlider.value()).toString(10)} ms`, 65, 777);
        text(`Precieze Delay: ${(Math.round(100 * this.preciseSlider.value())/100).toString(10)} ms`, 65, 827);
        text(`Totale Delay: ${this.roughSlider.value() + this.preciseSlider.value()} ms`, 65, 877);
        text(`∠θ = ${Math.round(100 * this.calcAngle(this.delay))/100} rad = ${Math.round(100 * this.calcAngle(this.delay) * 180 / Math.PI)/100}°`, 65, 907);
        fill(255);
    }

    update(){
        //berekent de nieuwe delay aan de hand van de slider-waardes
        this.delay = this.roughSlider.value()/1000 + this.preciseSlider.value()/1000;
    }
}