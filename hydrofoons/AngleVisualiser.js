class AngleVisualiser{
    //tekent de hoek en een pijl die aangeeft in welke richting de vijand zit
    constructor(){

    }
    draw(angle /*[rad]*/){
        fill(0);
        stroke(0);
        strokeWeight(4);
        line(200, 500, 400, 500);
        line(400, 300, 400, 500);
        line(400, 500, 400 - 200 * Math.cos(angle), 500 - 200 * Math.sin(angle));
        
        push();
        translate(400 - 200 * Math.cos(angle), 500 - 200 * Math.sin(angle))
        line(0,0, 20 * Math.cos(angle + Math.PI/4), 20 * Math.sin(angle + Math.PI/4));
        line(0,0, 20 * Math.cos(angle - Math.PI/4), 20 * Math.sin(angle - Math.PI/4));
        pop();

        strokeWeight(1);
        text("θ", 210 + 100 * Math.sin(angle), 500 - 75 * Math.sin(angle));
    }
}