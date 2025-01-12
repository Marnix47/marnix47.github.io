// class Sound {
//     buffer;
//     sampleRate = 3000;
// }

// Sound.playArray500ms = function(array){

// }

// Sound.initialize = function(){
//     Sound.
// }

// Sound.sampleRate = 3000;
// Sound.requiredArrayLength = Sound.sampleRate/2;

class Sound {
    buffer;
    sampleRate;
    requiredArrayLength500ms;

    constructor(sampleRate = 8000){
        this.context = new AudioContext({sampleRate: sampleRate})
        this.sampleRate = sampleRate;
        this.requiredArrayLength500ms = sampleRate / 2;
        // this.source = this.context.createBufferSource();
        // if(window.confirm("Met geluid ervaren?")){
        //     this.context.resume();
        // }
        
    }

    playArray500ms(data/* array van uitwijkingen*/){
        if(data.length !== this.requiredArrayLength500ms){
            console.error("Array heeft verkeerde lengte");
            return;
        }
        console.log(this.context.state);
        console.log(data);

        const buffer = this.context.createBuffer(
            2,
            this.context.sampleRate / 2,
            this.context.sampleRate,
        );


        const bufferingArray = buffer.getChannelData(0);
        // console.log(buffer.length);
        for(var i = 0; i < buffer.length; i++){
            // bufferingArray[i] = Math.sin(2 * Math.PI * i / 10);
            bufferingArray[i] = data[i]
            // if(i > 200){
            //     // bufferingArray[i] = 0;
            //     bufferingArray[i] = Math.sin(2 * Math.PI * i / 20);

            // }
        }
        const source = this.context.createBufferSource();

        source.buffer = buffer;
        console.log(buffer.duration);

        source.connect(this.context.destination);
        // source.stop(.5);

        source.start();
        // window.onload = function(){
        //     const button = document.getElementById("1");
        //     button.addEventListener("click", event => {
        //         source.start();
        //         // source.stop(buffer.length/this.context.sampleRate);
        //     })
        // }
        
    }

    playArray1000ms(data/* array van uitwijkingen, -1 tot 1*/){
        if(data.length !== this.sampleRate){
            console.error("Array heeft verkeerde lengte");
            return;
        }
        // console.log(this.context.state);
        // console.log(data);

        const buffer = this.context.createBuffer(
            2,
            this.context.sampleRate,
            this.context.sampleRate,
        );


        const bufferingArray = buffer.getChannelData(0);
        // console.log(buffer.length);
        for(var i = 0; i < buffer.length; i++){
            // bufferingArray[i] = Math.sin(2 * Math.PI * i / 10);
            bufferingArray[i] = data[i]
            // if(i > 200){
            //     // bufferingArray[i] = 0;
            //     bufferingArray[i] = Math.sin(2 * Math.PI * i / 20);

            // }
        }
        const source = this.context.createBufferSource();

        source.buffer = buffer;
        // console.log(buffer.duration);

        source.connect(this.context.destination);
        // source.stop(.5);

        source.start();
        // window.onload = function(){
        //     const button = document.getElementById("1");
        //     button.addEventListener("click", event => {
        //         source.start();
        //         // source.stop(buffer.length/this.context.sampleRate);
        //     })
        // }
        
    }
}