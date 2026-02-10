export async function getDepartures(stationCode, handler){
    const req = new XMLHttpRequest();
    req.addEventListener("load", handler);
    req.open("GET", "https://delicate-night-bb28.maxome7.workers.dev/reisinformatie-api/api/v2/departures?station=" + stationCode);
    req.send();
}

export async function getArrivals(stationCode, handler){
    const req = new XMLHttpRequest();
    req.addEventListener("load", handler);
    req.open("GET", "https://delicate-night-bb28.maxome7.workers.dev/reisinformatie-api/api/v2/arrivals?station=" + stationCode);
    req.send();
}

export async function getJourney(code, handler){
    const req = new XMLHttpRequest();
    req.addEventListener("load", handler);
    req.open("GET", "https://delicate-night-bb28.maxome7.workers.dev/reisinformatie-api/api/v2/journey?train=" + code);
    req.send();
}