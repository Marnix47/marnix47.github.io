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

