class TotalMemory {
    entries; //Array van WaveMemory-objects
    hydrophone; //Hydrophone-object

    constructor(hydrophone){
        this.entries = [];
        this.hydrophone = hydrophone;
    }


    removeWave(){
        this.entries.shift();
    }

    addWave(wave /*Wave-object*/){
        //voegt een WaveMemory-object toe aan het totale geheugen van de hydrofoon
        this.entries.push(new WaveMemory(wave, this.hydrophone));
    }
}