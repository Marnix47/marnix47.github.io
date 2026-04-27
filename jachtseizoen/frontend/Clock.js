class Clock {
    timeouts = [];
    intervals = [];
    uitloopUntil = null;
    uitloopInterval = null;
    locationIntervals = [];
    locationTimerUpdateInterval = null;
    locationIntervalZoeker = null;
    countdownInterval = null;
    shrinkInterval = null;

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
     * @returns {Number} difference in ms
     */
    static dateDifference(date1, date2){
        return Math.abs(date1.valueOf() - date2.valueOf());
    }

    /**
     * 
     * @param {ms} until 
     * @param {Function} endHandler handler when uitloop is over.
     */
    setUitloopUpdate(until, endHandler){
        this.uitloopUntil = until;
        console.log(endHandler);
        if(this.uitloopInterval) clearInterval(this.uitloopInterval);
        this.uitloopInterval = setInterval(() => {
            if(this.uitloopUntil <= Date.now()){
                console.log(endHandler);
                clearInterval(this.uitloopInterval);
                endHandler();
            }
            let diff = Math.floor((this.uitloopUntil - Date.now())/1000);
            let seconds = diff % 60;
            if(seconds < 10){
                seconds = "0" + String(seconds);
            }
            document.querySelector("#uitloopTimer").innerHTML = `${Math.floor(diff/60)}:${seconds}`;
        }, 1000);
    }

    /**
     * 
     * @param {Date[]} dates Will only set timeouts for dates in the future
     * @param {Function} handler function handling location update, timestamp is passed as only param
     */
    addLocationIntervals(dates, handler){
        this.clearLocationIntervals();
        for(let date of dates){
            if(date < Date.now()) continue;
            this.locationIntervals.push(setTimeout(handler, date - Date.now(), date));
            console.log(date - Date.now());
        }
        console.log(this.locationIntervals);
    }

    addLocationIntervalZoeker(handler, time = 10000){
        this.locationIntervalZoeker = setInterval(handler, time);
        // handler();
    }

    /**
     * Clears all location update timeouts
     */
    clearLocationIntervals(){
        for(let id of this.locationIntervals){
            clearTimeout(id);
        }
    }

    setLocationUpdateTimerInterval(){
        if(this.locationTimerUpdateInterval) clearInterval(this.locationTimerUpdateInterval);
        this.locationTimerUpdateInterval = setInterval(() => {
            if(dataManager.getNextTimeStamp() == null){
                clearInterval(this.locationTimerUpdateInterval);
                document.querySelector("#nextLocationHeader").style.display = "none";
                return;
            }
            let diff = dataManager.getNextTimeStamp() - Date.now();
            diff = Math.floor(diff/1000);
            // console.log(dataManager.getNextTimeStamp(), diff, Clock.formatCountDown(diff));
            document.querySelector("#nextLocationUpdateTimer").innerHTML = Clock.formatCountDown(diff);
        }, 1000);
    }

    setCountdownInterval(){
        if(this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = setInterval(() => {
            if(Date.now() >= dataManager.lastData.end){
                clearInterval(this.countdownInterval);
                dataManager.handleGameOver();
            }
            let time = Math.floor((dataManager.lastData.end - Date.now())/1000)
            document.querySelector("#gameCountdown").innerHTML = Clock.formatCountDown(time);
        }, 1000);
    }

    setShrinkInterval(handler){
        if(this.shrinkInterval) clearInterval(this.shrinkInterval);
        this.shrinkInterval = setInterval(() => {
            let time = Math.floor((dataManager.lastData.RingTimeStamps[1].date - Date.now())/1000);
            // console.log(time);
            if(time <= 0){
                clearInterval(this.shrinkInterval);
                handler();
            }
            document.querySelector("#nextShrinkTimer").innerHTML = Clock.formatCountDown(time);
        }, 1000);
    }

    /**
     * Formats seconds into (m)m:ss
     * @param {seconds} seconds 
     */
    static formatCountDown(seconds){
        let minutes = Math.floor(seconds/60);
        seconds %= 60;
        if(seconds < 10) seconds = "0" + String(seconds);
        return `${minutes}:${seconds}`;
    }

    
}