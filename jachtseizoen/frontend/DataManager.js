
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
            Alert.alert("Kon niet achterhalen welke speler je bent.");
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
            mapService.renderPlayers();
            if(data.speler == this.playerid && data.content.persons[this.playerid].frozenUntil == null){
                clock.clearLocationIntervals();
                // clock.setLocationUpdateTimerInterval();
                this.locationUpdateHandler();
                clock.addLocationIntervalZoeker(this.locationUpdateHandler.bind(this));
                Alert.alert(`Je bent nu zoeker.`);
            } else if(data.speler == this.playerid){
                this.locationUpdateHandler();
                this.updateBackgroundOffline();
                Alert.alert(`Je time-out van ${data.content.freezeDuration/60} minuten gaat nu in. Blijf staan.`);
            } else {
                Alert.alert(`${data.speler} is gepakt door ${data.zoeker}.`);
            }
        }
        if(data.msgType == "freed"){
            this.updatePlayerUI();
            mapService.renderPlayers();
            if(data.speler == this.playerid){
                Alert.alert(`Je bent bevrijd. Je blijft speler en mag weer bewegen.`);
            } else {
                Alert.alert(`${data.speler} is bevrijd door ${data.bevrijder}.`);
            }
        }
        if(data.msgType == "freeze-over"){
            this.updatePlayerUI();
            mapService.renderPlayers();
            if(data.speler == this.playerid){
                clock.clearLocationIntervals();
                clock.addLocationIntervalZoeker(this.locationUpdateHandler.bind(this));
                this.locationUpdateHandler();
                Alert.alert(`Je bent nu zoeker.`);
            } else {
                Alert.alert(`${data.speler} is nu zoeker.`);
            }
        }
        if(data.msgType == "request-caught" && data.target == this.playerid){
            // let confirmed = Alert.confirm(`Bevestig dat ${data.origin} je heeft gepakt.`);
            // if(Alert.confirm(`Bevestig dat ${data.origin} je heeft gepakt.`)){
            //     this.connection.send(JSON.stringify({msgType:"caught", content: {origin: this.playerid, target: data.origin}}));
            // }
            this.handleRequestCaught(data);
            return;
        }
        if(data.msgType == "request-freed" && data.target == this.playerid){
            // if(Alert.confirm(`Bevestig dat ${data.origin} je heeft bevrijd.`)){
            //     this.connection.send(JSON.stringify({msgType:"freed", content: {origin: this.playerid, target: data.origin}}));
            // }
            this.handleRequestFreed(data);
            return;
        }
        if(data.msgType == "offline"){
            this.updatePlayerUI();
            mapService.renderPlayers();
            if(data.origin == this.playerid){
                this.updateBackgroundOffline();
            }
            clock.addTimeoutDate(data.content.persons[data.origin].offlineUntil + 100, (() => {
                this.updatePlayerUI();
                mapService.renderPlayers();
                this.updateBackgroundOffline();
            }).bind(this));
        }
        if(data.msgType == "zoeker-location-powerup"){
            if(data.origin == this.playerid){
                mapService.renderPlayers();
                this.updatePlayerUI();
                clock.addTimeoutDate(data.content.persons[data.origin].zoekerLocationUntil + 100, (() => {
                    mapService.renderPlayers();
                }).bind(this));
            }
        }
        if(data.msgType == "first"){
            //SET ALL LOCATIONUPDATETIMESTAMPS IN CLOCK
            document.querySelector("#gameWrapper").style.maxHeight = 0;
            document.querySelector("#map").style.maxHeight = 0;
            document.querySelector("#playerListWrapper").style.display = "none";
            this.updateBackgroundOffline();

            clock.setLocationUpdateTimerInterval();
            if(data.content.persons[this.playerid]?.role == "speler" && (data.content.everyoneLiveAfter > Date.now() || data.content.everyoneLiveAfter == null)){
                clock.addLocationIntervals(data.content.locationUpdateTimeStamps, this.locationUpdateHandler.bind(this));
                clock.addTimeoutDate(data.content.everyoneLiveAfter, (() => {
                    clock.clearLocationIntervals();
                    this.locationUpdateHandler();
                    clock.addLocationIntervalZoeker(this.locationUpdateHandler.bind(this));
                }).bind(this));
            } else {
                clock.addLocationIntervalZoeker(this.locationUpdateHandler.bind(this));
            }
            let latestUpdateStamp = data.content.persons[this.playerid]?.lastKnownLocation?.date;
            if(!latestUpdateStamp) latestUpdateStamp = 0;
            if(latestUpdateStamp < this.getLatestTimeStamp()){
                this.locationUpdateHandler(this.getLatestTimeStamp());
            }

            if(data.content.uitloop * 1000 + data.content.start > Date.now()){
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

            Object.values(this.lastData.persons).forEach(x => {
                if(x.offlineUntil != null && x.offlineUntil > Date.now()){
                    clock.addTimeoutDate(data.content.persons[x.id].offlineUntil, (() => {
                        this.updatePlayerUI();
                        this.updateBackgroundOffline();
                    }).bind(this));
                }
            });

            let zoekerLocationUntil = this.lastData.persons[this.playerid].zoekerLocationUntil
            if(zoekerLocationUntil != null && zoekerLocationUntil >= Date.now()){
                clock.addTimeoutDate(zoekerLocationUntil + 100, (() => {
                    mapService.renderPlayers();
                }).bind(this));
            }
            
            if(this.lastData.RingTimeStamps.length > 1){
                let secondaryCircleCoords = this.lastData.RingTimeStamps[1];
                secondaryMapCircle = L.circle([secondaryCircleCoords.lat, secondaryCircleCoords.lng], {
                    radius: secondaryCircleCoords.rad,
                    color: "dodgerblue",
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
        }

    }
    
    /**
     * Spelers can only see all other spelers, zoekers can see everyone.
     * @returns {*[]} Data of all players that the current user is allowed to see
     */
    getDrawablePlayers(){
        if(this.playerid == null || !this.lastPlayerData || !this.lastData) return [];
        // if(this.lastPlayerData.role == "zoeker") return Object.entries(this.lastData.persons).map(([x,y]) => y);
        let ret = [];
        let revealZoekerLocations = this.lastPlayerData.zoekerLocationUntil > Date.now();
        for(let [id, player] of Object.entries(this.lastData.persons)){
            let isOffline = player.offlineUntil != null && player.offlineUntil > Date.now();
            if( (player.role == "speler" && (!isOffline || this.isEveryoneLiveNow())) || 
                (this.lastPlayerData.role == "zoeker" && player.role == "zoeker") || 
                (this.lastPlayerData.role == "speler" && player.role == "zoeker" && revealZoekerLocations)
            ){
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

    /**
     * @returns {seconds} seconds untill live
     * @returns {null} iff gameState.everyoneLiveAfter is null OR time stamp has passed
     */
    getTimeUntilLive(){
        if(!this.lastData || Object.entries(this.lastData).length == 0) return null;
        if(this.lastData.everyoneLiveAfter == null || this.lastData.everyoneLiveAfter <= Date.now()) return null;
        return Math.floor((this.lastData.everyoneLiveAfter - Date.now())/1000);
    }

    uitloopEndHandler(){
        document.querySelector("#gameWrapper").style.maxHeight = "unset";
        document.querySelector("#map").style.maxHeight = "unset";
        document.querySelector("#playerListWrapper").style.display = "flex";
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
        if(USERLOCATION.lat == null) setTimeout(this.locationUpdateHandler.bind(this), 5000, date);
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
    }

    /**
     * (Re)draws all players on the map
     */
    updatePlayerUI(){
        let playerData = this.lastData.persons;
        for(let [player, value] of Object.entries(playerData)){
            if(!this.playerNodes.has(player)){
                let n = this.createPlayerNode(value);
                document.querySelector("#playerList").appendChild(n);
            } else {
                this.updatePlayerNode(this.playerNodes.get(player), value);
            }
        }
        let offlineButtonDisplay = "unset";
        if(this.lastPlayerData.role == "zoeker" || this.lastPlayerData.offlineUntil != null || this.lastData.offlineDuration == null){
            offlineButtonDisplay = "none";
        }
        document.querySelector("#offlineButton").style.display = offlineButtonDisplay;
        let zoekerLocationButtonDisplay = "unset";
        if(this.lastPlayerData.role == "zoeker" || this.lastPlayerData.zoekerLocationUntil != null || !this.lastData.zoekerLocationPowerupEnabled){
            zoekerLocationButtonDisplay = "none";
        }
        document.querySelector("#zoekerLocationButton").style.display = zoekerLocationButtonDisplay;
    }

    /**
     * Creates an HTMLEelement for a player on the map and adds it to the playerNodes Map
     * @param {Person} playerInfo 
     * @returns {HTMLDivElement}
     */
    createPlayerNode(playerInfo){
        this.updateBackgroundOffline();
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
            if(event.target.lastPressed && event.target.lastPressed > Date.now() - 1e4) return;
            event.target.lastPressed = Date.now();
            let target = event.target.parentNode.parentNode.querySelector(".playerListNodeName").innerHTML;
            connection.send(JSON.stringify({msgType: "request-caught", content: {target: target, origin: this.playerid}}));
        });

        n.querySelector(".playerListNodeCaughtButton").style.display = displayValue(caughtButtonDisplay);
        n.querySelector(".playerListNodeCaughtText").style.display = displayValue(caughtTextDisplay);
        n.classList.add(playerInfo.role);

        let freedDisplay = playerInfo.role == "speler" 
            && this.lastPlayerData.role == "speler" 
            && playerInfo.frozenUntil != null 
            && playerInfo.frozenUntil > Date.now()
            && playerInfo.id != this.playerid;
        n.querySelector(".playerListNodeFreedButton").addEventListener("click", event => {
            if(event.target.lastPressed && event.target.lastPressed > Date.now() - 1e4) return;
            event.target.lastPressed = Date.now();
            let target =  event.target.parentNode.parentNode.querySelector(".playerListNodeName").innerHTML;
            this.connection.send(JSON.stringify({msgType: "request-freed", content: {target: target, origin: this.playerid}}));
        });
        n.querySelector(".playerListNodeFreedButton").style.display = displayValue(freedDisplay)
        this.playerNodes.set(playerInfo.id, n);
        return n;
    }

    /**
     * Updates the role, location and visibility on the map according to the provided playerInfo
     * @param {HTMLDivElement} n 
     * @param {Person} playerInfo 
     */
    updatePlayerNode(n, playerInfo){
        n.querySelector(".playerListNodeRole").innerHTML = playerInfo.role;
        let caughtButtonDisplay = this.lastData.persons[this.playerid].role == "zoeker"
            && playerInfo.role == "speler"
            && playerInfo.frozenUntil == null;
        let freedButtonDisplay = playerInfo.frozenUntil != null 
            && playerInfo.role == "speler"
            && this.lastData.persons[this.playerid].role == "speler"
            && this.lastData.persons[this.playerid].frozenUntil == null
            && playerInfo.id != this.playerid;
        let caughtTextDisplay = playerInfo.caughtAfter !== null 
            && playerInfo.frozenUntil == null;
        /**
         * @param {Boolean} q
         */
        let displayValue = q => q ? "unset" : "none";

        n.querySelector(".playerListNodeCaughtButton").style.display = displayValue(caughtButtonDisplay);
        n.querySelector(".playerListNodeCaughtText").style.display = displayValue(caughtTextDisplay);
        n.querySelector(".playerListNodeFreedButton").style.display = displayValue(freedButtonDisplay);
        
        if(!n.classList.contains(playerInfo.role)){
            n.classList.replace(DataManager.oppositeRole(playerInfo.role), playerInfo.role);
        }
    }

    handleGameOver(){
        window.alert("Het spel is afgelopen");
        window.location.replace("/jachtseizoen/frontend/welcome.html");
    }

    updateBackgroundOffline(){
        let id = StorageHandler.getGame().playerid;
        let untill = this.lastData.persons[id].offlineUntil;
        let isFrozen = this.lastData.persons[id].frozenUntil > Date.now();
        let color = "darkslategray";
        if(!untill || untill <= Date.now() || this.isEveryoneLiveNow() || isFrozen){
            color = "#20B2AA";
        }
        document.querySelector(":root").style.setProperty("--bg-color", color);
    }

    isEveryoneLiveNow(){
        return this.lastData.everyoneLiveAfter <= Date.now() && this.lastData.everyoneLiveAfter != null;
    }

    async handleRequestCaught(data){
        if(await Alert.confirm(`Bevestig dat ${data.origin} je heeft gepakt.`)){
            this.connection.send(JSON.stringify({msgType:"caught", content: {origin: this.playerid, target: data.origin}}));
        }
    }

    async handleRequestFreed(data){
        if(await Alert.confirm(`Bevestig dat ${data.origin} je heeft bevrijd.`)){
            this.connection.send(JSON.stringify({msgType:"freed", content: {origin: this.playerid, target: data.origin}}));
        }
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