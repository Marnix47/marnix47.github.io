class Hydrophone {
    position; //p5.Vector, positie
    totalMemory; //van klasse TotalMemory
    graphBuffer; //p5.Graphics, slaat de getekende grafiek op
    index; //n'de hydrofoon
    vertices; //Array, hoekpunten van de driehoek die de hydrofoon representeert
    height; //hoogte van de driehoek
    width; //breedte van de driehoek

    constructor(x, y, index){
        this.position = createVector(x,y);
        this.totalMemory = new TotalMemory(this);
        this.graphBuffer = createGraphics(500,100);
        this.index = index;
        //driehoek: hoogte = 60px, breedte = 60px
        this.height = 60;
        this.width = 60;
        this.vertices = [scale * x, scale * y + this.height, scale * x - this.width / 2, scale * y, scale * x + this.width/2, scale * y];
    }

    draw(){
        Hydrophone.drawInstance(this.position.x, this.position.y, this.width, this.height, this.index, true, false);
    }

    renderBuffer(){
        this.graphBuffer.background(255);
        //laat de laatste 500 ms zien, 1 ms per pixel
        //rechts is wat nu binnenkomt, links is 500 ms geleden
        //rode lijn geeft live, blauwe lijn geeft met delay
        //uitwijking van 0 hoort bij y = 50, uitwijking van 1 bij y = 0, -1 bij 100
        let values = new Array(500).fill(0);
        this.totalMemory.entries.forEach(entry => {
            for(var t = 0; t < 500; t++){
                values[t] += entry.displacement((frameStart - t)/1000, delayObject.delay * this.index);
            }
        })
        this.graphBuffer.strokeWeight(3);
        this.graphBuffer.stroke("red");
        for(var t = 0; t < 499; t++){
            this.graphBuffer.line(500 - t, 50 - 50 * values[t], 499-t, 50 - 50 * values[t + 1]);
        }
    }

}

Hydrophone.drawInstance = function(x, y, width, height, index, drawCircle, interpretAsPx, txt = ""){
    //tekent de driehoek die een hydrofoon voorstelt
    textAlign(CENTER, CENTER);
    fill(255);
    strokeWeight(2);
    stroke(0);
    var vertices;
    if(interpretAsPx){
        vertices = [x, y + height,x - width / 2, y, x + width/2, y];
    } else {
        vertices = [scale * x, scale * y + height, scale * x - width / 2, scale * y, scale * x + width/2, scale * y];

    }
    triangle(...vertices);
    strokeWeight(1);
    textSize(txt == "" ? 20 : 30);
    if(drawCircle){
        circle(x * scale, y * scale, 6);
    }
    fill(0);
    if(interpretAsPx){
        text(txt == "" ? `H${index + 1}` : txt, x, y + height/2 - 11);
    } else {
        text(txt == "" ? `H${index + 1}` : txt, x * scale, y * scale + height/2 - 11);
    }
}