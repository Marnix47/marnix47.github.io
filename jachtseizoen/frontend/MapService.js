class MapService {
    map;
    dataManager;
    playerPoints;
    /**
     * 
     * @param {*} map 
     * @param {DataManager} dataManager 
     */
    constructor(map, dataManager){
        this.map = map;
        this.dataManager = dataManager;
        this.playerPoints = new Map();
    }

    renderPlayers(){
        let players = this.dataManager.getDrawablePlayers();
        players.forEach(renderPlayer);
    }

    renderPlayer(player){
        if(!player || player.entries().length == 0) return;
        if(this.playerPoints.has(player.id)){
            this.playerPoints.get(player.id).remove();
        }
        let coordinateInfo = player.lastKnownLocation.coords;
        let leafletPosition = L.latLng(coordinateInfo.langitue, coordinateInfo.longitude);
        let freshLocation = player.role == "speler" && player.lastKnownLocation.date >= this.dataManager.getLatestTimeStamp();
        let icon = L.divIcon(
            `<div class="playerIcon ${player.role} ${freshLocation ? "" : "oldLocation"}">
                <p>${player.id}</p>
            </div>`
        )
        let marker = L.marker(leafletPosition, {icon:icon});
        marker.addTo(this.map);
        this.playerPoints.set(player.id, marker);
    }
}