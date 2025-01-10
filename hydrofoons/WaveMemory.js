class WaveMemory{
    start; //[s], starttijd
    period; //[s], periode van de golf
    oscillator; //p5.Oscillator, geluidsobject
    stopCondition; //setTimeout()
    waveId;

    constructor(period, id, hydrophone){
        this.start = performance.now()/1000; //de tijd van eerste detectie is 'nu'
        this.period = period;
        this.oscillator = new p5.Oscillator();
        this.stopCondition;
        this.waveId = id;
        this.hydrophone = hydrophone;
    }

    playSound(){
        this.oscillator.freq(1/this.period);
        this.oscillator.start();
        this.stopCondition = setTimeout(this.stopSound, 500);
    }

    stopSound(){
        this.oscillator.stop();
    }
    
    displacement(t){
        // if(performance.now() % 1000 > 900){
        //     return Math.sin(5*t);

        // } else {
        //     return 0;
        // }
        return Math.sin(20*t);
        if(t < this.start || t > this.start + this.period){
            return 0;
        }
        return Math.sin(2 * Math.PI * (t - this.start) / period);
    }
}