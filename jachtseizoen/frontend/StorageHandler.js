const testURL = "https://fictional-space-umbrella-9g79794jj9rc76qw-8787.app.github.dev/";
const productionURL = "";
// const apiURL = testURL;
let inTesting = false;
if(window.location.hostname == "marnix47.github.io") inTesting = false; 
const apiURL = inTesting ? testURL : "https://jachtseizoen.maxome7.workers.dev/";

class StorageHandler {
    static GAMEKEY = "gameid"
    /**s
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
