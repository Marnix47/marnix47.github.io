new p5(function(c){
    var planets = [];
    c.setup = function(){
        c.angleMode(c.RADIANS)
        c.createCanvas(1920, 1080);
        planets.push(new Body("sun"))
        planets.push(new Body({color: "darkbrown", radius: 2, speed: 4.8, distance: 70, parent: planets[0]})) //Mercurius
        planets.push(new Body({color: "brown", radius: 6, speed: 3.5, distance: 100, parent: planets[0]})) //Venus
        planets.push(new Body({color: "green", radius: 6, speed: 3, distance: 130, parent: planets[0]})) //Earth
        planets.push(new Body({color: "brown", radius: 3, speed: 2.4, distance: 160, parent: planets[0]})) //Mars
        planets.push(new Body({color: "NavajoWhite", radius: 70, speed: 1.3, distance: 250, parent: planets[0]})) //Jupiter
        planets.push(new Body({color: "Bisque", radius: 58, speed: 1, distance: 390, parent: planets[0]})) //Saturn
        planets.push(new Body({color: "lightblue", radius: 25, speed: .7, distance: 460, parent: planets[0]})) //Uranus
        planets.push(new Body({color: "darkblue", radius: 25, speed: .5, distance: 520, parent: planets[0]})) //Neptune
        for(var i = 0; i < 80; i++){
            //Jupiter moons:
            planets.push(new Body({color: "lightgrey", radius: 2, speed: Math.random() * 4, distance: 72 + Math.random(), parent: planets[5]}))
        }
        planets.push(new Body({color: "lightgrey", radius: 2, speed: .4, distance: 9, parent: planets[3]})) //Mars
        console.log(planets.length)
    }
    c.draw = function(){
        console.log(planets[11])
        c.noStroke();
        c.frameRate(200);
        
        c.background("black")
        c.fill("white")
        c.textSize(20)
        c.text(Math.round(c.frameRate()), 10, 20)
        setSunPosition();
        for(var planet of planets){
            planet.render();
        }
    }

    function setSunPosition(){
        planets[0].position.x = c.width / 2 + Math.sqrt(Math.abs(c.mouseX))
        planets[0].position.y = c.height / 2 + Math.sqrt(Math.abs(c.mouseY))
    }

    class Body{
        constructor(properties){
            //{color, radius, speed, distance, parent}
            if(properties === "sun"){
                this.color = "yellow";
                this.radius = 50;
                this.distance = 0;
                this.angle = 0;
                this.center = {x: c.width / 2, y: c.height / 2};
                this.position = this.center;
            } else {
                this.color = properties.color;
                this.radius = properties.radius;
                this.speed = properties.speed;
                this.distance = properties.distance;
                this.center = properties.parent.position;
                this.parent = properties.parent
                this.angle = Math.random() * 2 * Math.PI;
            }
        }
        render(){
            if(this.distance !== 0){
                this.position = this.getPosition();
            }
            c.fill(this.color)
            c.ellipse(this.position.x, this.position.y, 2 * this.radius, 2 * this.radius);
            this.angle += this.speed / 100
        }
        getPosition(){
            this.center = this.parent.position;
            var x = this.center.x + this.distance * Math.cos(this.angle);
            var y = this.center.y + this.distance * Math.sin(this.angle);
            return {x: x, y: y}
        }
    }
})