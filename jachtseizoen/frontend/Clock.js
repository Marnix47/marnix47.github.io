class Clock {
    timeouts = [];
    intervals = [];

    constructor(){

    }

    /**
     * Wrapper for setTimeout
     * @param {Number} delay delay in ms
     * @param {Function} fun callback function
     * @param  {...any} args args to pass to callback function
     * @returns {Number} id of timeout
     */
    addTimeoutDelay(delay, fun, ...args){
        let t = setTimeout(delay, fun, ...args);
        timeouts.push(t);
        return t;
    }

    addTimeoutDate(date, fun, ...args){
        return this.addTimeoutDelay(dateDifference(Date.now(), date), fun, ...args);
    }

    /**
     * Returns the positive difference in ms between two dates
     * @param {Date} date1 
     * @param {Date} date2 
     * @returns {Number} //difference in ms
     */
    static dateDifference(date1, date2){
        return Math.abs(date1.valueOf() - date2.valueOf());
    }

    
}