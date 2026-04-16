class StorageHandler {
    static GAMEKEY = "gameid"
    /**
     * 
     * @param {Number} gameid 
     * @param {String} playerid name/id of player
     * @param {Boolean} started
     * @param {Date} date timestamp at which the game ends
     */
    static setGame(gameid, playerid, started, date){
        localStorage.setItem(this.GAMEKEY, JSON.stringify({gameid:gameid, playerid:playerid, started:started, date:date}));
    }
    /**
     * 
     * @returns {{gameid: Number, playerid: String, started: Boolean date:Date}}
     */
    static getGame(){
        return JSON.parse(localStorage.getItem(this.GAMEKEY));
    }

    static removeGame(){
        localStorage.removeItem(this.GAMEKEY);
    }

}
