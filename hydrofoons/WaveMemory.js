class WaveMemory{
    start; //[s], starttijd
    period; //[s], periode van de golf
    stopCondition; //setTimeout()

    constructor(wave, hydrophone){
        this.start = wave.calcTimeUntillArrival(hydrophone); //het tijdstip waarop de golf bij de hydrofoon zal worden gedetecteerd
        this.period = wave.period;
        this.stopCondition;
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
    
    displacement(t /*[s]*/, delay /*[s]*/, countForRemoval = true){
        //berekent de uitwijking op het tijdstip (t + delay)

        //hier wordt ook nagegaan of de golf alle hydrofoons al voorbij zal zijn.
        //als alle golven oneindag lang blijven bestaan zal het programma namelijk vastlopen
        //berekeningen die verder van tevoren worden gedaan, voor bijv. geluid, tellen niet mee voor het verwijderen.
        if(countForRemoval && t + delay > this.start + this.period + 8){
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
        return Math.sin(2 * Math.PI * (this.start - time) / this.period);

    }
}