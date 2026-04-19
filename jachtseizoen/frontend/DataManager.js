
class DataManager {
    connection;
    lastData; //parsed JSON from last message, or {} if no message has been received
    playerid = null; //null iff player hasn't been created yet
    lastPlayerData = null; //like lastData, but only containing the last known parsed JSON from this player. Null iff no data obtained yet.

    
    /**
     * 
     * @param {Connection} connection 
     */
    constructor(connection) {
        this.connection = connection;
        connection.setIncomingMessageHandler(this.messageHandler.bind(this));
        this.lastData = {};
        this.playerid = StorageHandler.getGame()?.playerid;
        if(!this.playerid){
            alert("Kon niet achterhalen welke speler je bent.");
            window.location.replace("/jachtseizoen/frontend/welcome.html");
        }
    }

    messageHandler(event){
        const data = JSON.parse(event.data);
        console.log(event);
        if(data.msgType == "handshake") return;
        this.lastData = data.content;
        console.log(data.content);
        this.lastPlayerData = data.content.persons[this.playerid];
        if(data.msgType == "location-update"){
            mapService.renderPlayers();
        }
        if(data.msgType == "first"){
            //SET ALL LOCATIONUPDATETIMESTAMPS IN CLOCK
            // console.log(data.uitloop, data.start, Date.now());
            document.querySelector("#gameWrapper").style.maxHeight = 0;
            document.querySelector("#map").style.maxHeight = 0;
            clock.setLocationUpdateTimerInterval();
            if(data.content.persons[this.playerid]?.role == "speler"){
                clock.addLocationIntervals(data.content.locationUpdateTimeStamps, this.locationUpdateHandler.bind(this));
            } else {
                clock.addLocationIntervalZoeker(this.locationUpdateHandler.bind(this));
            }
            let latestUpdateStamp = data.content.persons[this.playerid]?.lastKnownLocation?.date;
            if(!latestUpdateStamp) latestUpdateStamp = 0;
            console.log(data.content);
            console.log(latestUpdateStamp, Date.now());
            if(latestUpdateStamp < this.getLatestTimeStamp()){
                this.locationUpdateHandler(this.getLatestTimeStamp());
            }

            if(data.content.uitloop * 1000 + data.content.start > Date.now()){
                console.log("SETTING UITLOOP");
                clock.setUitloopUpdate(data.content.uitloop * 1000 + data.content.start, this.uitloopEndHandler.bind(this));
            } else {
                this.uitloopEndHandler();
            }
            //TODO: call handler for moving to play phase
        }

    }
    
    /**
     * Spelers can only see all other spelers, zoekers can see everyone.
     * @returns {*[]} Data of all players that the current user is allowed to see
     */
    getDrawablePlayers(){
        if(this.playerid == null || !this.lastPlayerData || !this.lastData) return [];
        if(this.lastPlayerData.role == "zoeker") return Object.entries(this.lastData.persons).map(([x,y]) => y);
        let ret = [];
        for(let [id, player] of Object.entries(this.lastData.persons)){
            // let player = this.lastData.players[id];
            if(player.role == "speler"){
                ret.push(player);
            }
        }
        return ret;
    }

    /**
     * 
     * @returns {Date} The most recently passed timeStamp
     * @returns {undefined} Undefined iff no data has been received
     */
    getLatestTimeStamp(){
        //we can safely assume the timeStamps in lastData was already sorted ascendingly by the server
        if(!this.lastData || Object.entries(this.lastData).length == 0) return undefined;
        let latestTimeStamp = undefined;
        for(let timeStamp of this.lastData.locationUpdateTimeStamps){
            if(Date.now() >= timeStamp){
                latestTimeStamp = timeStamp
            }
        }
        return latestTimeStamp;
    }

    /**
     * @returns {Date}
     * @returns {null} iff no data has been received OR all time stamps have passed
     */
    getNextTimeStamp(){
        if(!this.lastData || Object.entries(this.lastData).length == 0) return undefined;
        let latestTimeStamp = this.lastData.locationUpdateTimeStamps.find(el => Date.now() < el);
        if(!latestTimeStamp) return null;
        return latestTimeStamp;
    }

    uitloopEndHandler(){
        document.querySelector("#gameWrapper").style.maxHeight = "unset";
        document.querySelector("#map").style.maxHeight = "unset";
        document.querySelector("#uitloopWrapper").display = "none";
        mapService.renderPlayers();
    }

    /**
     * 
     * @param {Date|null} date The date associated with this location update, null if not associated with any particular date
     */
    locationUpdateHandler(date){
        console.log("SENDING LOCATION");
        if(USERLOCATION.lat == null) setTimeout(this.locationUpdateHandler, 5000, date);
        this.connection.send(JSON.stringify({
            msgType: "location-update",
            content: {
                playerid: this.playerid,
                lat: USERLOCATION.lat,
                lng: USERLOCATION.lng,
                date: date ? date : Date.now(),
                type: date ? "stamp" : "live"
            }
            
        }));
        // navigator.geolocation.getCurrentPosition((position) => {
        //     console.log("LOCATION ACQUIRED");
            
        // }, () => {
        //     //on fail, retry in 5 seconds
        //     console.warn("LOCATION ERROR");
        //     setTimeout(this.locationUpdateHandler, 5000, date);
        // });
    }

}