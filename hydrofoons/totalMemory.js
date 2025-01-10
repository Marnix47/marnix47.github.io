class TotalMemory {
    entries; //Array van WaveMemory-objects
    hydrophone; //Hydrophone-object

    constructor(hydrophone){
        this.entries = [];
        this.hydrophone = hydrophone;
    }

    containsWave(id){
        this.entries.forEach(x => {
            if(x.id == id){
                return true;
            }
        })
        return false;
    }

    removeWave(){
        this.entries.shift();
    }

    addWave(wave /*Wave-object*/){
        this.entries.push(new WaveMemory(wave.period, wave.id, this.hydrophone));
    }

}