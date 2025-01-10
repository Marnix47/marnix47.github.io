class GraphPanel {
    leftX = 1300;
    rightX = 1920;
    graphBuffer;

    constructor(leftX = 300, rightX = 1920){
        this.leftX = leftX
        this.rightX = rightX;
        this.graphBuffer = createGraphics(500, 300);
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
                    values[t] += entry.displacement((frameStart - t)/1000, delayObject.delay * x.index);
                }
            })
        })
        
        this.graphBuffer.strokeWeight(3);
        this.graphBuffer.stroke("red");
        for(var t = 0; t < 499; t++){
            this.graphBuffer.line(500 - t, 150 - 50 * values[t], 499-t, 150 - 50 * values[t + 1]);
        }

        image(this.graphBuffer, this.leftX, 600);
    }

}