
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
        connection.setIncomingMessageHandler(messageHandler);
        this.lastData = {};
    }

    messageHandler(event){
        const data = JSON.parse(event.data);
        if(data.msgType == "locationUpdate"){
            
        }
        lastData = data;
    }
    
    /**
     * Spelers can only see all other spelers, zoekers can see everyone.
     * @returns {*[]} Data of all players that the current user is allowed to see
     */
    getDrawablePlayers(){
        if(playerid == null || this.lastData.entries().length == 0 || this.lastPlayerData.entries().length == 0) return [];
        if(this.lastPlayerData.role == "zoeker") return this.lastData.players;
        let ret = [];
        for(let id of this.lastData.players){
            let player = this.lastData.players[id];
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
        if(this.lastData.entries().length == 0) return undefined;
        let latestTimeStamp = undefined;
        for(let timeStamp of this.lastData.locationUpdateTimeStamps){
            if(Date.now() <= timeStamp){
                latestTimeStamp = timeStamp
            }
        }
        return latestTimeStamp;
    }

}