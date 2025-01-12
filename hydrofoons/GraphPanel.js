class GraphPanel {
    //klasse die de rechterkant van het scherm regelt
    leftX = 1250;
    rightX = 1920;
    graphBuffer;

    constructor(leftX = 1250, rightX = 1920){
        this.leftX = leftX
        this.rightX = rightX;
        this.graphBuffer = createGraphics(500, 340);
    }

    drawGraphBuffer(buffer, index){
        image(buffer, this.leftX, index * 100);
    }
    
    drawTotalGraph(){
        this.graphBuffer.background(255);
        //laat de laatste 500 ms zien, 1 ms per pixel
        //rechts is wat nu binnenkomt, links is 500 ms geleden
        //rode lijn geeft live, blauwe lijn geeft met delay
        //uitwijking van 0 hoort bij y = 50, uitwijking van 1 bij y = 0, -1 bij 100
        let values = new Array(500).fill(0);
        hydrophones.forEach(x => {
            x.totalMemory.entries.forEach(entry => {
                for(var t = 0; t < 500; t++){
                    values[t] += entry.displacement((frameStart - t)/1000, delayObject.delay * x.index, x);
                }
            })
        })
        
        this.graphBuffer.strokeWeight(3);
        this.graphBuffer.stroke("red");
        for(var t = 0; t < 499; t++){
            this.graphBuffer.line(500 - t, 170 - 50 * values[t], 499-t, 170 - 50 * values[t + 1]);
        }

        image(this.graphBuffer, this.leftX + 100, 610);
        Hydrophone.drawInstance(this.leftX + 50, 750, hydrophones[0].height, hydrophones[0].width, 0, false, true, "Σ")
    }

    drawGraphBuffers(){
        //tekent de grafieken van alle individuele hydrofoons
        hydrophones.forEach(x => {
            textAlign(CENTER, BOTTOM);
            fill(0);
            stroke(0);
            strokeWeight(1);
            text(`+${Math.round((hydrophones.length - 1 - x.index) * delayObject.delay * 1000)} ms`, this.leftX + 50, x.index * 100 + 25);
            Hydrophone.drawInstance(this.leftX + 50, x.index * 100 + 30, x.width, x.height, x.index, false, true);
            image(x.graphBuffer, this.leftX + 100, x.index * 100);
            textAlign(LEFT, BOTTOM);
        })
    }

    draw(){
        //algemene tekenfunctie van het rechterdeel van het scherm
        //moet aangeroepen worden nadat de golven zijn getekend
        noStroke();
        fill("white");
        rect(this.leftX, 0, this.rightX - this.leftX, 1080);
        stroke("black");
        strokeWeight(5);
        stroke("lightblue");
        line(this.leftX, 0, this.leftX, 1080);
        this.drawGraphBuffers();
        this.drawTotalGraph();
        fill(0);
    }

}