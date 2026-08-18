
(async function(){
    let playerid = StorageHandler.getGame().playerid;
    let gameid = StorageHandler.getGame().gameid;
    let response = await fetch(apiURL + "game/" + gameid);
    let gameState = await response.json();
    console.log(gameState);
    let zoekersWon = Object.values(gameState.persons)
        .every(x => x.caughtAfter != null || x.frozenUntil != null || x.role == "zoeker");
    let playerWasZoeker = gameState.persons[playerid].caughtAfter == null && gameState.persons[playerid].frozenUntil == null && gameState.persons[playerid].role == "zoeker";
    let playerWasCaught = gameState.persons[playerid].caughtAfter != null || gameState.persons[playerid].frozenUntil != null;
    document.querySelector("#teamWonText").innerHTML = zoekersWon ? "De zoekers hebben gewonnen!" : "De verstoppers hebben gewonnen!";
    if(zoekersWon == playerWasZoeker){
        //won
        document.querySelector("#wonContainer").style.display = "flex";
    } else if(playerWasCaught){
        document.querySelector("#caughtContainer").style.display = "flex";
    } else {
        document.querySelector("#lostContainer").style.display = "flex";
    }
})();