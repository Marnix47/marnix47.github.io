class Hydrophone {
    position; //p5.Vector, positie
    totalMemory; //van klasse signalMemory
    graphBuffer;
    delay;

    constructor(x, y){
        this.position = createVector(x,y);
        this.totalMemory = new TotalMemory(this);
        this.graphBuffer = createGraphics(500,100);
        this.delay = 0;
    }

    update(){
        // console.log(golf.calcDisplacementAtPoint(this.position));
        // this.memory.update(golf.calcDisplacementAtPoint(this.position));
    }
    draw(){
        circle(this.position.x, this.position.y, 20);
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
                values[t] += entry.displacement((performance.now() - t)/1000);
            }
        })
        strokeWeight(2);
        stroke("red");
        for(var t = 0; t < 499; t++){
            this.graphBuffer.line(500 - t, 50 - 50 * values[t], 499-t, 50 - 50 * values[t + 1]);
        }

        image(this.graphBuffer,0,0);

        
    }

    /*
    elke hydrofoon houdt bij op welke tijdstippen een golf binnengekomen is, en welke frequentie die golf heeft.
    elke golf is in werkelijkheid precies 1 golflengte lang
    na het verstrijken van de delay wordt die golf gedurende 0.5s afgespeeld als geluid

    in de totale functie wordt de artificiële versterking gebaseerd op de hoogte van de max. uitwijking van de totale golffunctie,
     t.o.v. wat die in het ideale geval zou zijn
    
    */
}