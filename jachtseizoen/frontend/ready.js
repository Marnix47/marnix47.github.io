const connection = new Connection(apiURL + "ws/" + StorageHandler.getGame().gameid, messageHandler);
const playerNodes = new Map();
let gameState = {};
// connection.setIncomingMessageHandler(messageHandler);
const qrcode = new QRCode(document.querySelector("#qrcode"), window.location.origin + "/jachtseizoen/frontend/join.html?gameId=" + StorageHandler.getGame().gameid)

document.querySelector("#playButton").addEventListener("click", (event) => {
    if(connection.state() > WebSocket.OPEN){
        //connection is closed or closing
        try{
            connection.retry();
        } catch {
            alert("Kan geen verbinding maken. De pagina wordt herladen.");
            window.location.reload();
        }
    }
    console.log("SENDING START SIGNAL");
    connection.send(JSON.stringify({msgType: "start", content:{}}));
});

function messageHandler(event){
    console.log(event.data);
    const data = JSON.parse(event.data);
    if(data.msgType == "start"){
        StorageHandler.setGame(data.content.id, StorageHandler.getGame().playerid, data.content.start, data.content.end);
        connection.close();
        window.location.replace("/jachtseizoen/frontend/play.html");
    }
    if(data.msgType == "first"){
        gameState = data.content;
        if(gameState.end && gameState.end < Date.now()){
            //HANDLE GAME OVER
            handleGameEnded();
        }
        if(gameState.start){
            //HANDLE ENTERING GAME
            handleGameStart();
        }
    }
    if(data.msgType != "handshake"){
        gameState = data.content;
        updatePlayerUI();
    }
}

function handleGameEnded(){
    StorageHandler.removeGame();
    connection.close();
    window.location.replace("/jachtseizoen/frontend/welcome.html");
}

function handleGameStart(){
    //write relevant game state to storage
    StorageHandler.setGame(
        StorageHandler.getGame().id,
        StorageHandler.getGame().player,
        gameState.start,
        gameState.end
    );
    //close connection
    connection.close();
    //load play.html
    window.location.replace("/jachtseizoen/frontend/play.html");
}


/**
 * 
 */
function updatePlayerUI(){
    let playerData = gameState.persons;
    console.log(playerNodes);
    console.log(playerData);
    for(let [player, value] of Object.entries(playerData)){
        console.log(player, value);
        if(!playerNodes.has(player)){
            let n = createNode(player, value.role);
            document.querySelector("#playerRepeater").appendChild(n);
            console.log("CREATED " + player);
        } else {
            updatePlayerNode(playerNodes.get(player), value.role);
        }
    }
    for(let key of playerNodes.keys()){
        if(!Object.keys(playerData).includes(key)){
            playerNodes.delete(key);
            console.warn("DELETED " + key);
        }
    }

}

/**
 * 
 * @param {String} name 
 * @param {"zoeker"|"speler"} role 
 * @returns {Node}
 */
function createNode(name, role){
    let n = document.querySelector("#dummyNode").cloneNode(true);
    console.log(n.childNodes);
    console.log(document.querySelector("#dummyNode").childNodes);
    n.querySelector(".playerName").innerHTML = name;
    n.querySelector(".playerRole").innerHTML = role;
    n.querySelector(".switchRoleButton").innerHTML = "Maak " + oppositeRole(role);
    n.querySelector(".switchRoleButton").style.display = (
        gameState.creator == StorageHandler.getGame().playerid || name == StorageHandler.getGame().playerid
    ) ? "inline" : "none";
    playerNodes.set(name, n);
    n.querySelector(".switchRoleButton").addEventListener("click", (event) => {
        handlePlayerRoleChangedLocally(name);
    })
    return n;
}

/**
 * 
 * @param {Node} node 
 * @param {"zoeker"|"speler"} newRole 
 */
function updatePlayerNode(node, newRole){
    node.querySelector(".playerRole").innerHTML = newRole;
    node.querySelector(".switchRoleButton").innerHTML = "Maak " + oppositeRole(newRole);
}

/**
 * 
 * @param {String} name 
 */
function handlePlayerRoleChangedLocally(name){
    const playerNode = playerNodes.get(name);
    const newRole = oppositeRole(playerNode.querySelector(".playerRole").innerText);
    // playerNode.querySelector(".playerRole") = oppositeRole(gameState.players[name].role);
    //DONT UPDATE LOCALLY, ONLY ON CONFIRMATION FROM SERVER
    connection.send(JSON.stringify({msgType:"change-role", content:{playerid:name, newRole:newRole}}))
}


/**
 * 
 * @param {"zoeker"|"speler"} current 
 * @returns {"zoeker"|"speler"}
 */
function oppositeRole(current){
    return current == "zoeker" ? "speler" : "zoeker"
}