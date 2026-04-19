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
        players.forEach(this.renderPlayer.bind(this));
    }

    renderPlayer(player){
        if(!player || Object.entries(player).length == 0) return;
        if(!player.lastKnownLocation || !player.lastKnownLocation.lng) return;
        if(this.playerPoints.has(player.id)){
            this.playerPoints.get(player.id).remove();
        }
        console.log(player.lastKnownLocation);
        console.log(this.dataManager.getLatestTimeStamp());
        let coordinateInfo = player.lastKnownLocation;
        let leafletPosition = L.latLng(coordinateInfo.lat, coordinateInfo.lng);
        let freshLocation = player.role == "speler" && player.lastKnownLocation.date >= this.dataManager.getLatestTimeStamp();
        if(player.role == "zoeker"){
            freshLocation = Date.now() - player.lastKnownLocation.date <= 1e4;
        }
        console.log(freshLocation);
        let icon = L.divIcon({
            html: `<div class="playerIcon ${player.role} ${freshLocation ? "freshLocation" : "oldLocation"}">
                <p>${player.id}</p>
            </div>`
        });
        let marker = L.marker(leafletPosition, {icon:icon});
        marker.addTo(this.map);
        this.playerPoints.set(player.id, marker);
    }
}