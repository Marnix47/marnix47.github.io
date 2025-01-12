
class Sound {
    buffer;
    sampleRate;
    requiredArrayLength500ms;

    constructor(sampleRate = 8000){
        this.context = new AudioContext({sampleRate: sampleRate})
        this.sampleRate = sampleRate;
        this.requiredArrayLength500ms = sampleRate / 2;
        
    }

    playArray500ms(data/* array van uitwijkingen, -1 tot 1*/){
        if(data.length !== this.requiredArrayLength500ms){
            console.error("Array heeft verkeerde lengte");
            return;
        }

        const buffer = this.context.createBuffer(
            2,
            this.context.sampleRate / 2,
            this.context.sampleRate,
        );


        const bufferingArray = buffer.getChannelData(0);
        for(var i = 0; i < buffer.length; i++){
            bufferingArray[i] = data[i]
        }
        const source = this.context.createBufferSource();

        source.buffer = buffer;

        source.connect(this.context.destination);

        source.detune.value = 2400;

        source.start();
        
    }

    playArray1000ms(data/* array van uitwijkingen, -1 tot 1*/){
        if(data.length !== this.sampleRate){
            console.error("Array heeft verkeerde lengte");
            return;
        }

        const buffer = this.context.createBuffer(
            2,
            this.context.sampleRate,
            this.context.sampleRate,
        );


        const bufferingArray = buffer.getChannelData(0);
        for(var i = 0; i < buffer.length; i++){
            bufferingArray[i] = data[i]
        }
        const source = this.context.createBufferSource();

        source.buffer = buffer;


        source.connect(this.context.destination);

        source.start();
        
    }
}