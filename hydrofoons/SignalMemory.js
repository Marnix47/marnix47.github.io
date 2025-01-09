class SignalMemory{
    last5000Values; //Number[5000]

    constructor(){
        this.last5000Values = new Array(5000).fill(0);
    }

    update(value){
        if(value != 0){
            console.warn(value);
        }
        this.last5000Values.unshift(value);
        this.last5000Values.pop();
    }

    getShiftedAmountOfValues(amount, shift = 0){
        //shift: how many ms ago to start.
        //amount: how many ms long.
        return this.last5000Values.slice(shift, amount + shift);
    }
}