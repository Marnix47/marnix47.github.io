if(!StorageHandler.getGame() || StorageHandler.getGame()?.end < Date.now()){
    window.location.replace("/jachtseizoen/frontend/welcome.html");
}
const connection = new Connection(apiURL + "ws/" + StorageHandler.getGame().gameid, undefined);
const dataManager = new DataManager(connection);
const clock = new Clock();
const mapService = new MapService(map, dataManager);

function fixIOSViewport() {
    document.documentElement.style.setProperty(
        '--vw',
        `${window.innerWidth}px`
    );
}

fixIOSViewport();
window.addEventListener('resize', fixIOSViewport);

window.onerror = (msg, source, lineno) => {
    alert(msg + source + lineno);
}

window.addEventListener("unhandledrejection", event => {
    alert("Unhandled Promise Rejection:", event.reason);
    event.preventDefault(); // optional: suppress console error
});

document.querySelector("#offlineButton").addEventListener("click", async event => {
    if(!(await Alert.confirm(`Weet je zeker dat je de eenmalige offline power-up wilt gebruiken? Je verdwijnt ${dataManager.lastData.offlineDuration/60} minuten van de map.`))) return;
    connection.send(JSON.stringify({msgType:"offline", origin:dataManager.playerid}));
});

document.querySelector("#zoekerLocationButton").addEventListener("click", async event => {
    if(!(await Alert.confirm(`Weet je zeker dat je de eenmalige zoeker locatie power-up wilt gebruiken? Je krijgt 10 seconden de locatie van de zoekers te zien.`))) return;
    connection.send(JSON.stringify({msgType:"zoeker-location-powerup", origin:dataManager.playerid}));
});
