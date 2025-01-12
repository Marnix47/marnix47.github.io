class Wave {
    //de voorkant van het golffront gaat omhoog door de evenwichtsstand, een sinusbeweging.

    orientation; //[radialen], hoek van het rechte golffront t.o.v. de x-as
    speed; //absolute snelheid, [m/s]
    period; //periode, [s]
    waveLength; //golflengte, [m], berekend uit periode en speed
    velocity; //p5.Vector, loodrecht op orientation, berekend uit orientation en speed
    totalLength; //totale lengte van het golffront, [m]


    constructor(x, y, orientation, speed, period){
        this.frontPosition = createVector(x, y);
        this.orientation = orientation;
        this.velocity = createVector(Math.cos(orientation), Math.sin(orientation)).setMag(speed);
        this.period = period;
        this.waveLength = speed * period;
        this.totalLength = this.waveLength;
        this.speed = speed;
    }

    move(dt /*tijdstap, [s]*/){
        this.frontPosition.add(this.velocity.copy().mult(dt));
    }

    draw(){
        //l: y = ax + b, met a = tan(orientation) en b = y - ax ingevuld voor frontPosition
        let a = Math.tan(this.orientation + Math.PI/2);
        let b = this.frontPosition.y - this.frontPosition.x * a;
        line(-scale * b/a, 0, 0, b * scale);

    }

    calcTimeUntillArrival(hydrophone){
        //implementatie van de formule van de afstand van een punt tot een lijn van de vorm ax + by = c:
        //d(P,l) = |a * x_P + b * y_P - c| / sqrt(a^2 + b^2)
        const a = Math.sin(this.orientation);
        const b = Math.cos(this.orientation);
        const c = this.frontPosition.x * a + this.frontPosition.y * b;
        const dist = (Math.abs(a * hydrophone.position.x + b * hydrophone.position.y - c) / Math.sqrt(a**2 + b**2));
        return dist / this.speed + frameStart/1000;
    }
}