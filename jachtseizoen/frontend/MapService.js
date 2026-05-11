class MapService {
    map;
    dataManager;
    playerPoints;
    freezeInterval;
    /**
     * 
     * @param {*} map 
     * @param {DataManager} dataManager 
     */
    constructor(map, dataManager){
        this.map = map;
        this.dataManager = dataManager;
        this.playerPoints = new Map();
        this.freezeInterval = setInterval((() => {
            this.dataManager.getDrawablePlayers().forEach(x => this.frozenIntervalHandler(x.id));
        }).bind(this), 1000);
    }

    renderPlayers(){
        this.playerPoints.forEach((v, k) => {
            v.remove();
        });
        let players = this.dataManager.getDrawablePlayers();
        players.forEach(this.renderPlayer.bind(this));
    }

    renderPlayer(player){
        if(!player || Object.entries(player).length == 0) return;
        if(!player.lastKnownLocation || !player.lastKnownLocation.lng) return;
        // if(this.playerPoints.has(player.id)){
        //     this.playerPoints.get(player.id).remove();
        // }
        console.log(player.lastKnownLocation);
        console.log(this.dataManager.getLatestTimeStamp());
        let coordinateInfo = player.lastKnownLocation;
        let leafletPosition = L.latLng(coordinateInfo.lat, coordinateInfo.lng);
        let freshLocation = player.role == "speler" && player.lastKnownLocation.date >= this.dataManager.getLatestTimeStamp();
        if(player.role == "zoeker"){
            freshLocation = Date.now() - player.lastKnownLocation.date <= 1e4;
        }
        let frozenText = player.frozenUntil > Date.now() ? "frozen" : "";
        let icon = L.divIcon({
            html: `<div class="playerIcon ${player.id} ${player.role} ${frozenText} ${freshLocation ? "freshLocation" : "oldLocation"}">
                <p>${player.id}</p>
            </div>`
        });
        let marker = L.marker(leafletPosition, {icon:icon});
        marker.addTo(this.map);
        this.playerPoints.set(player.id, marker);
        this.frozenIntervalHandler(player.id);
    }

    frozenIntervalHandler(playerid){
        if(!this.dataManager.lastData) return;
        let frozenUntil = this.dataManager.lastData.persons[playerid].frozenUntil;
        let node = document.querySelector(`.playerIcon.${playerid}`);
        if(!node) return;
        let textEl = node.querySelector(`p`);
        if(frozenUntil == null){
            textEl.innerHTML = playerid;
            return;
        }
        let text = Clock.formatCountDown(
            Math.floor(Clock.dateDifference(frozenUntil, Date.now()) / 1000)
        );
        textEl.innerHTML = text;
    }
}