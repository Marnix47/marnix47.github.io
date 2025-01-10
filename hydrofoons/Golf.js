class Wave {
    //de voorkant van het golffront gaat omhoog door de evenwichtsstand, een sinusbeweging.

    center; //p5.Vector
    orientation; //[radialen], hoek van het rechte golffront t.o.v. de x-as
    speed; //absolute snelheid, [m/s]
    period; //periode, [s]
    waveLength; //golflengte, [m], berekend uit periode en speed
    duration; //tijd die een willekeurig punt in de golf zou zitten, [s]. Stel de duration is 2s, en T is 1s, dan bestaat dit uit twee hele golflengtes.
    velocity; //p5.Vector, loodrecht op orientation, berekend uit orientation en speed
    totalLength; //totale lengte van het golffront, [m]
    drawBuffer; //p5.Graphics, externe buffer om de golf op te tekenen.
    bufferIsDefined; //[boolean], geeft aan of de buffer al getekend is. Dit hoeft maar 1 keer.
    id;


    constructor(x, y, orientation, speed, period, duration){
        this.frontPosition = createVector(x, y);
        this.orientation = orientation;
        this.velocity = createVector(Math.sin(orientation), Math.cos(orientation)).setMag(speed);
        this.period = period;
        this.duration = duration;
        this.waveLength = speed * period;
        this.totalLength = speed * duration;
        this.drawBuffer = createGraphics(createVector(width, height).mag(), 500); //width: diagonaal van het scherm, height: 500 px
        this.bufferIsDefined = false;
        this.speed = speed;
        this.id = getNewId();
    }

    move(dt /*tijdstap, [s]*/){
        this.frontPosition.add(this.velocity.copy().mult(dt));
        // console.log(this.frontPosition);
        // console.log(this.frontPosition.x, this.frontPosition.y);
    }

    draw(){
        if(!this.bufferIsDefined){
            this.defineBuffer();
            this.bufferIsDefined = true;
        }
        circle(this.frontPosition.x, this.frontPosition.y, 20);
        // imageMode(CENTER);
        image(this.drawBuffer, 0, 500);

    }

    defineBuffer(){
        console.log(this);
        //1px = 1 cm. 1 lijn is 1px breed en representeert dus 1 cm.
        const baseColor = color(0, 0, 255);
        for(var i = 0; i < this.totalLength * 100; i++){
            //lijnen van breedte 1:
            this.drawBuffer.strokeWeight(1);
            //omhoog door de evenwichtsstand -> fase = 0
            const phase = ((i / 100) / this.waveLength) % 1;
            // console.log(phase);
            let alpha = Math.sin(phase * 2 * Math.PI) * 127 + 127
            
            // baseColor.setBlue(Math.sin(phase * 2 * Math.PI) * 127 + 127); 
            //laagste punt -> alpha = 0, hoogste punt -> alpha = 254, maximaal.
            baseColor.setRed(alpha);
            baseColor.setGreen(alpha);
            // baseColor.setBlue(100);
            this.drawBuffer.stroke(baseColor);
            this.drawBuffer.line(0, i, width, i);
        }
    }

    calcDisplacementAtPoint(point /*p5.Vector*/){
        //de minimale afstand van het punt (S) tot de voorkant van de golf (lijn W) is de formule voor de afstand van een punt tot een lijn van de vorm ax + by = c:
        //d(W,S) = (ABS(a*x_S + b*y_S - c) / sqrt(a^2 + b^2);
        //De eerste stap is dus het berekenen van de coëfficienten a, b & c:
        const a = Math.sin(this.orientation);
        const b = Math.cos(this.orientation);
        // console.log(this.orientation);
        const c = this.frontPosition.x * a + this.frontPosition.y * b;
        // console.log(a, b, c);
        //de formule invullen geeft:
        const dist = (Math.abs(a * point.x + b * point.y - c) / Math.sqrt(a**2 + b**2));
        // console.log(dist);
        if(dist > this.totalLength || ((this.velocity.y < 0) ? point.y < (-a * point.x + c)/b : point.y > (-a * point.x + c)/b)){
            //de golf is maar aan 1 kant van de frontPosition, dus moeten we kijken of het punt aan de kant van de golf zit
            //anders kan het gebeuren dat een punt weliswaar een klein genoege afstand tot het golffront heeft, maar niet in de golf zit en dat die dan toch wordt meegerekend
            //tevens is er bij een afstand meer dan de totale lengte ook sprake van een uitwijking van 0.
            return 0;
        }
        const phase = (dist / this.waveLength) % 1;
        const displacement = Math.sin(phase * 2 * Math.PI);
        return displacement;
    }

    checkIfPointIsInWave(point /*p5.Vector*/){
        //de minimale afstand van het punt (S) tot de voorkant van de golf (lijn W) is de formule voor de afstand van een punt tot een lijn van de vorm ax + by = c:
        //d(W,S) = (ABS(a*x_S + b*y_S - c) / sqrt(a^2 + b^2);
        //De eerste stap is dus het berekenen van de coëfficienten a, b & c:
        const a = Math.sin(this.orientation);
        const b = Math.cos(this.orientation);
        // console.log(this.orientation);
        const c = this.frontPosition.x * a + this.frontPosition.y * b;
        // console.log(a, b, c);
        //de formule invullen geeft:
        const dist = (Math.abs(a * point.x + b * point.y - c) / Math.sqrt(a**2 + b**2));
        // console.log(dist);
        if(dist > this.totalLength || ((this.velocity.y < 0) ? point.y < (-a * point.x + c)/b : point.y > (-a * point.x + c)/b)){
            //de golf is maar aan 1 kant van de frontPosition, dus moeten we kijken of het punt aan de kant van de golf zit
            //anders kan het gebeuren dat een punt weliswaar een klein genoege afstand tot het golffront heeft, maar niet in de golf zit en dat die dan toch wordt meegerekend
            //tevens is er bij een afstand meer dan de totale lengte ook sprake van een uitwijking van 0.
            return false;
        }
        return true;
    }
}