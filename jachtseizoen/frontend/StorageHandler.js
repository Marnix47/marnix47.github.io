const testURL = "https://bug-free-space-adventure-vj6v6v7q65w2wxw5-8787.app.github.dev/";
const productionURL = "";
// const apiURL = testURL;
let inTesting = true;
if(window.location.hostname == "marnix47.github.io" || window.location.hostname == "jachtseizoen.marnixvanvelzen.com" || window.location.hostname == "jachtseizoen-router.maxome7.workers.dev") inTesting = false; 
const apiURL = inTesting ? testURL : "https://jachtseizoen.maxome7.workers.dev/";

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

    /**
     * Clears the game info from localStorage
     */
    static removeGame(){
        localStorage.removeItem(this.GAMEKEY);
    }

}
