/**
 * //NewGameInput:
 * @typedef {{duration: seconds, interval: seconds, uitloop: seconds, lowerIntervalAfter: {interval: seconds, after: seconds}, player: string, primaryCircle: {lat: Long, lng: Long, radius: meters}, secondaryCircle: {lat: Long, lng: Long, radius: meters, after: seconds}}} NewGameInput
 */
/**
 * //GameState:
 * @typedef {{id: Number, start: Date, end: Date, duration: seconds, interval: seconds, uitloop: Date, lowerIntervalAfter: {interval: seconds, after: seconds}, persons: Person[], locationUpdateTimeStamps: Date[], RingTimeStamps: {date: Date, lat: Long, lng: Long, rad:meters}[]}}
 */
const HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

export class GameDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;

        this.sockets = new Set();
        this.gameState = null; // null = not loaded yet
    }

    async loadState() {
        if (this.gameState === null) {
            this.gameState = await this.state.storage.get("state") || {};
            console.log("Loaded state:", this.gameState);
            console.log("For id:" + this.state.id.toString());
        }
    }

    async saveGameState(newState) {
        this.gameState = newState;
        await this.state.storage.put("state", this.gameState);
        // console.log("Saved state:", this.gameState);
    }

    async fetch(request) {
        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: HEADERS });
        }

        await this.loadState();

        const url = new URL(request.url);

        if (url.pathname.startsWith("/new-game/")) {
            const id = parseInt(url.pathname.split("/")[2]);
            return this.handleNewGameRequest(request, id);
        }

        if (url.pathname.startsWith("/new-player/")) {
            const name = url.pathname.split("/")[2];
            return this.handleNewPlayerRequest(request, name);
        }

        // WebSocket upgrade
        if (request.headers.get("Upgrade") === "websocket") {
            return this.handleWebSocket(request);
        }

        return new Response("GameDO alive", { headers: HEADERS });
    }

    handleWebSocket(request) {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        server.accept();
        this.sockets.add(server);

        // console.log("TRYING TO SEND FIRST");
        server.send(JSON.stringify({msgType:"first", content: this.gameState}));

        server.addEventListener("close", () => {
            console.log("WEBSOCKET CLOSED");
            this.sockets.delete(server);
        });

        server.addEventListener("message", async evt => {
            
            const msg = evt.data;

            // Expect JSON string
            let parsed;
            try {
                parsed = JSON.parse(msg);
            } catch {
                console.log("Invalid JSON from WS");
                return;
            }
            // console.log(parsed);

            if(parsed.msgType == "handshake"){
                server.send(JSON.stringify({msgType:"handshake", content:{}}));
            }
            if(parsed.msgType == "change-role"){
                // console.log(parsed);
                this.gameState.persons[parsed.content.playerid].role = parsed.content.newRole;
                await this.saveGameState(this.gameState);
                this.broadcastNewState("change-role");
            }
            if(parsed.msgType == "start"){
                if(this.gameState.start){
                    return; //game already started, ignore
                }
                await this.startGameState();
                this.broadcastNewState("start");
            }
            if(parsed.msgType == "location-update"){
                let locationObject = {
                    lat: parsed.content.lat,
                    lng: parsed.content.lng,
                    date: parsed.content.date,
                    type: parsed.content.type // "stamp" or "live"
                };
                // console.log(locationObject);
                this.gameState.persons[parsed.content.playerid].lastKnownLocation = locationObject;
                await this.saveGameState(this.gameState);
                console.log(this.gameState.persons[parsed.content.playerid])
                this.broadcastNewState("location-update");
            }
            if(parsed.msgType == "request-caught"){
                console.log(parsed);
                for(const ws of this.sockets){
                    ws.send(JSON.stringify({msgType:"request-caught", content: this.gameState, target:parsed.content.target, origin: parsed.content.origin}));
                }
            }
            if(parsed.msgType == "caught"){
                this.gameState.persons[parsed.content.origin].caughtAfter = Date.now() - this.gameState.start - this.gameState.uitloop * 1000;
                this.gameState.persons[parsed.content.origin].caughtBy = parsed.content.origin;
                this.gameState.persons[parsed.content.origin].role = "zoeker";
                await this.saveGameState(this.gameState);
                // this.broadcastNewState("caught");
                let a = 1;;;
                for(const ws of this.sockets){
                    ws.send(JSON.stringify({msgType:"caught", content: this.gameState, speler:parsed.content.origin, zoeker: parsed.content.target}));
                }
            }

            // await this.saveGameState(parsed);

            // for (const ws of this.sockets) {
            //     // try { ws.send(msg); } catch { }
            // }
        });

        return new Response(null, { status: 101, webSocket: client });
    }

    broadcastNewState(msgType){
        for(const ws of this.sockets){
            ws.send(JSON.stringify({msgType:msgType, content: this.gameState}));
        }
    }

    async handleNewGameRequest(request, id) {
        if (!id) {
            return new Response("Invalid ID", { status: 500, headers: HEADERS });
        }

        // Game already exists?
        if (Object.keys(this.gameState).length !== 0) {
            return new Response("Game already exists", { status: 409, headers: HEADERS });
        }

        const input = JSON.parse(await request.text());
        console.log(input);

        // Validate input
        if (!input.player ||
            !input.duration || input.duration < 0 ||
            !input.interval || input.interval < 0 ||
            !input.primaryCircle ||
            !input.primaryCircle.radius ||
            !input.primaryCircle.lat ||
            !input.primaryCircle.lng ||
            !input.uitloop || input.uitloop < 0) {

            return new Response("BAD REQUEST", { status: 400, headers: HEADERS });
        }

        if (input.secondaryCircle) {
            if (!input.secondaryCircle.radius ||
                !input.secondaryCircle.after ||
                input.secondaryCircle.after < 0 ||
                input.secondaryCircle.after > input.duration) {

                return new Response("Secondary circle invalid", { status: 400, headers: HEADERS });
            }
        }

        let lowerIntervalAfter = input.lowerIntervalAfter;
        if (lowerIntervalAfter && (!lowerIntervalAfter.interval || lowerIntervalAfter.interval < 0 || lowerIntervalAfter < 0 || lowerIntervalAfter > input.duration)) {
            return new Response("Higher interval has illegal properties", { status: 400 });
        }

        const newState = this.buildGameStateFromInput(input, id);
        await this.saveGameState(newState);

        return new Response(id.toString(), { status: 200, headers: HEADERS });
    }

    buildGameStateFromInput(input, id) {
        const obj = {};

        obj.id = id;
        obj.start = null;
        obj.end = null;
        obj.interval = input.interval;
        obj.uitloop = input.uitloop;
        obj.duration = input.duration + obj.uitloop;
        obj.lowerIntervalAfter = input.lowerIntervalAfter || null;

        obj.persons = {};
        obj.persons[input.player] = {
            id: input.player,
            lastKnownLocation: null,
            role: "speler",
            caughtAfter: null,
            caughtBy: null
        };
        obj.creator = input.player;

        obj.locationUpdateTimeStamps = [];

        obj.RingTimeStamps = [
            {
                date: null,
                after: 0,
                lat: input.primaryCircle.lat,
                lng: input.primaryCircle.lng,
                rad: input.primaryCircle.radius
            }
        ];

        if (input.secondaryCircle) {
            obj.RingTimeStamps.push({
                date: null,
                after: obj.uitloop + input.secondaryCircle.after,
                lat: input.secondaryCircle.lat,
                lng: input.secondaryCircle.lng,
                rad: input.secondaryCircle.radius
            });
        }

        return obj;
    }

    async handleNewPlayerRequest(request, name) {
        if (!name) {
            return new Response("Naam is leeg", { status: 400, headers: HEADERS });
        }

        if (Object.keys(this.gameState).length === 0) {
            return new Response("Er bestaat geen game met deze code", { status: 400, headers: HEADERS });
        }

        if (this.gameState.start !== null) {
            return new Response("Game is al begonnen of beëindigd", { status: 400, headers: HEADERS });
        }

        if (this.gameState.persons[name]) {
            return new Response("Naam is al in gebruik", { status: 400, headers: HEADERS });
        }

        this.gameState.persons[name] = {
            id: name,
            lastKnownLocation: null,
            role: "speler",
            caughtAfter: null
        };

        await this.saveGameState(this.gameState);

        for (const ws of this.sockets) {
            console.log("SENDING NEW PLAYER");
            ws.send(JSON.stringify({msgType:"new-player", content: this.gameState}));
        }

        return new Response("OK", { status: 200, headers: HEADERS });
    }

    /**
     * Mutates the gameState from ready state to started
     */
    async startGameState(){
        this.gameState.start = Date.now();
        this.gameState.end = Date.now() + this.gameState.duration * 1000;
        let lowerAfter = this.gameState.lowerIntervalAfter?.after;
        if(!lowerAfter){
            lowerAfter = this.gameState.duration + this.gameState.uitloop;
        } else {
            lowerAfter += this.gameState.uitloop;
        }
        let lowerInterval = this.gameState.lowerIntervalAfter?.interval;
        let time = this.gameState.uitloop;
        let interval = this.gameState.interval;
        let stamps = [];
        while(time < this.gameState.duration){
            stamps.push(time);
            console.log(lowerInterval, time, lowerInterval, lowerAfter);
            if(lowerInterval && time + lowerInterval >= lowerAfter){
                interval = lowerInterval;
                time += interval;
            } else if(lowerInterval && time + interval >= lowerAfter){
                time = lowerAfter;
                interval = lowerInterval;
            } else {
                time += interval;
            }
        }
        console.log("TIMESTAMPS:", stamps);
        this.gameState.locationUpdateTimeStamps = stamps.map(x => Date.now() + 1000 * x);
        for(let ring of this.gameState.RingTimeStamps){
            // console.log(ring);
            ring.date = Date.now() + ring.after*1000;
        }
        await this.saveGameState(this.gameState);
    }
}
