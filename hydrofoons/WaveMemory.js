class WaveMemory{
    start; //[s], starttijd
    period; //[s], periode van de golf
    oscillator; //p5.Oscillator, geluidsobject
    stopCondition; //setTimeout()
    waveId;

    constructor(wave, hydrophone){
        // this.start = performance.now()/1000 + .5; //de tijd van eerste detectie is 'nu'
        this.start = wave.calcTimeUntillArrival(hydrophone);
        this.period = wave.period;
        this.oscillator = new p5.Oscillator();
        this.stopCondition;
        this.waveId = wave.id;
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
    
    displacement(t /*[s]*/, delay /*[s]*/, hydrophone = hydrophones[0]){
        if(t + delay > this.start + this.period + 8){
            this.hydrophone.totalMemory.removeWave();
            if(this.hydrophone.index === hydrophones.length - 1){
                //als dit de laatste hydrofoon is, zal de golf verder niet meer opgevangen worden
                //dus kan de golf helemaal verwijderd worden.
                waves.shift();
            }
            return 0;
        }
        let time = t + delay;

        if(time < this.start || time > this.start + this.period){
            return 0;
        }
        // return Math.sin(2 * Math.PI * (t + delay - this.start) / this.period);
        return Math.sin(2 * Math.PI * (this.start - t - delay) / this.period);

    }
}