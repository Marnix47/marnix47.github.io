
class DataManager {
    connection;
    lastData; //parsed JSON from last message, or {} if no message has been received
    playerid = null; //null iff player hasn't been created yet
    lastPlayerData = null; //like lastData, but only containing the last known parsed JSON from this player. Null iff no data obtained yet.
    playerNodes = new Map(); //maps playerid to HTML node in List
    
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
        if(data.msgType == "location-update" || data.msgType == "caught"){
            mapService.renderPlayers();
            this.updatePlayerUI();
        }
        if(data.msgType == "caught"){
            this.updatePlayerUI();
            if(data.speler == this.playerid){
                clock.clearLocationIntervals();
                clock.setLocationUpdateTimerInterval();
            }
            window.alert(`${data.speler} is gepakt door ${data.zoeker}.`);
        }
        if(data.msgType == "request-caught" && data.target == this.playerid){
            if(window.confirm(`Bevestig dat ${data.origin} je heeft gepakt.`)){
                this.connection.send(JSON.stringify({msgType:"caught", content: {origin: this.playerid, target: data.origin}}));
            }
            return;
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
                // console.log("SETTING UITLOOP");
                clock.setUitloopUpdate(data.content.uitloop * 1000 + data.content.start, this.uitloopEndHandler.bind(this));
            } else {
                this.uitloopEndHandler();
            }
            let primaryCircleCoords = this.lastData.RingTimeStamps[0];
            if(!this.lastData.RingTimeStamps[1] || this.lastData.RingTimeStamps[1].date > Date.now()){
                primaryMapCircle = L.circle([primaryCircleCoords.lat, primaryCircleCoords.lng], {
                    radius: primaryCircleCoords.rad,
                    color: "red",
                    fillOpacity: .2
                }).addTo(map);
            }
            
            if(this.lastData.RingTimeStamps.length > 1){
                let secondaryCircleCoords = this.lastData.RingTimeStamps[1];
                secondaryMapCircle = L.circle([secondaryCircleCoords.lat, secondaryCircleCoords.lng], {
                    radius: secondaryCircleCoords.rad,
                    color: "lightskyblue",
                    fillOpacity: .25
                }).addTo(map);
                clock.setShrinkInterval(() => {
                    document.querySelector("#nextShrinkHeader").style.display = "none";
                    primaryMapCircle?.remove();
                });
            } else {
                document.querySelector("#nextShrinkHeader").style.display = "none";
            }
            clock.setCountdownInterval();
            this.updatePlayerUI();
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
        // console.log("DISABLING UITLOOP WRAPPER");
        document.querySelector("#gameWrapper").style.maxHeight = "unset";
        document.querySelector("#map").style.maxHeight = "unset";
        document.querySelector("#uitloopWrapper").style.display = "none";
        document.querySelector("#uitloopWrapper").style.maxHeight = 0;

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

    updatePlayerUI(){
        let playerData = this.lastData.persons;
        for(let [player, value] of Object.entries(playerData)){
            if(!this.playerNodes.has(player)){
                let n = this.createPlayerNode(value);
                document.querySelector("#playerList").appendChild(n);
                console.log(n);
                document.querySelector("#playerList").appendChild(n);
            } else {
                this.updatePlayerNode(this.playerNodes.get(player), value);
            }
        }
    }

    createPlayerNode(playerInfo){
        let n = document.querySelector("#dummyPlayerListNode").cloneNode(true);
        n.querySelector(".playerListNodeName").innerHTML = playerInfo.id;
        n.querySelector(".playerListNodeRole").innerHTML = playerInfo.role;
        let caughtButtonDisplay = this.lastData.persons[this.playerid].role == "zoeker"
            && playerInfo.role == "speler";
        let caughtTextDisplay = playerInfo.caughtAfter !== null;
        /**
         * @param {Boolean} q
         */
        let displayValue = q => q ? "inline" : "none";

        n.querySelector(".playerListNodeCaughtButton").addEventListener("click", (event) => {
            console.log("CLICKED");
            let target = event.target.parentNode.parentNode.querySelector(".playerListNodeName").innerHTML;
            connection.send(JSON.stringify({msgType: "request-caught", content: {target: target, origin: this.playerid}}));
        });

        n.querySelector(".playerListNodeCaughtButton").style.display = displayValue(caughtButtonDisplay);
        n.querySelector(".playerListNodeCaughtText").style.display = displayValue(caughtTextDisplay);
        n.classList.add(playerInfo.role);
        
        this.playerNodes.set(playerInfo.id, n);
        return n;
    }

    updatePlayerNode(n, playerInfo){
        n.querySelector(".playerListNodeRole").innerHTML = playerInfo.role;
        let caughtButtonDisplay = this.lastData.persons[this.playerid].role == "zoeker"
            && playerInfo.role == "speler";
        let caughtTextDisplay = playerInfo.caughtAfter !== null;
        /**
         * @param {Boolean} q
         */
        let displayValue = q => q ? "unset" : "none";

        n.querySelector(".playerListNodeCaughtButton").style.display = displayValue(caughtButtonDisplay);
        n.querySelector(".playerListNodeCaughtText").style.display = displayValue(caughtTextDisplay);
        
        if(!n.classList.contains(playerInfo.role)){
            n.classList.replace(DataManager.oppositeRole(playerInfo.role), playerInfo.role);
        }
    }

    handleGameOver(){
        window.alert("Het spel is afgelopen");
        window.location.replace("/jachtseizoen/backend/welcome.html");
    }

    /**
     * 
     * @param {"zoeker"|"speler"} current 
     * @returns {"zoeker"|"speler"}
     */
    static oppositeRole(current){
        return current == "zoeker" ? "speler" : "zoeker"
    }

}