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
}
export class GameDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;

        this.sockets = new Set();
        this.gameState = "{}";

        this.state.blockConcurrencyWhile(async () => {
            this.gameState = await this.state.storage.get("state") || "{}";
        });
    }

    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname.startsWith("/new-game/")) {
            return this.handleNewGameRequest(request, url.pathname.split("/")[2]);
        }
        if (request.headers.get("Upgrade") === "websocket") {
            const [client, server] = Object.values(new WebSocketPair());
            server.accept();

            this.sockets.add(server);

            server.addEventListener("close", () => {
                this.sockets.delete(server);
            });

            server.addEventListener("message", async (evt) => {
                const msg = evt.data;

                // Your game logic later; for now just store JSON string
                this.gameState = msg;
                await this.state.storage.put("state", this.gameState);

                for (const ws of this.sockets) {
                    try { ws.send(msg); } catch { }
                }
            });

            return new Response(null, { status: 101, webSocket: client });
        }

        return new Response("GameDO alive");
    }

    /**
     * 
     * @param {Request} request 
     * @returns {Response} 
     */
    async handleNewGameRequest(request, id) {
        console.log(id);
        id = parseInt(id);
        if (!id) return new Response("Could not generate a valid ID", { status: 500 })
        if (this.gameState != "{}") {
            //if gameState is not {}, the game already exists and cannot be initialized
            return new Response("Game already exists", { status: 206, headers: HEADERS });
        }

        const input = JSON.parse(await request.text());
        if (!input.player || !input.duration || input.duration < 0 || !input.interval || input.interval < 0 || !input.primaryCircle || !input.primaryCircle.radius || !input.primaryCircle.lat || !input.primaryCircle.lng || !input.uitloop || input.uitloop < 0) {
            //input invalid
            return new Response("BAD REQUEST", { status: 400, headers: HEADERS });
        }
        let secondaryCircle = input.secondaryCircle;
        if (secondaryCircle && (!secondaryCircle.radius || !secondaryCircle.after || secondaryCircle.after < 0 || secondaryCircle.after > input.duration)) {
            return new Response("Secondary circle has illegal properties", { status: 400 });
        }
        let lowerIntervalAfter = input.lowerIntervalAfter;
        if (lowerIntervalAfter && (!lowerIntervalAfter.interval || lowerIntervalAfter.interval < 0 || lowerIntervalAfter < 0 || lowerIntervalAfter > input.duration)) {
            return new Response("Higher interval has illegal properties", { status: 400 });
        }
        this.gameState = JSON.stringify(this.buildGameStateFromInput(input));
        return new Response(id, {status: 200,
            headers: HEADERS
        });

    }

    /**
     * 
     * @param {NewGameInput} input 
     * @param {Number} id 
     * @returns 
     */
    buildGameStateFromInput(input, id) {
        const obj = {};
        obj.id = id;
        obj.start = null;
        obj.end = null;
        obj.interval = input.interval;
        obj.uitloop = input.uitloop;
        obj.duration = input.duration + obj.uitloop;
        obj.lowerIntervalAfter = input.lowerIntervalAfter;
        obj.persons = {};
        obj.persons[input.player] = {
            id: input.player,
            lastKnownLocation: null,
            role: "player",
            caughtAfter: null
        }
        obj.locationUpdateTimeStamps = null;
        //UPDATE the date property of ringTimeStamps when starting the game
        obj.RingTimeStamps = [
            {
                date: null,
                after: 0,
                lat: input.primaryCircle.lat,
                lng: input.primaryCircle.lng,
                rad: input.primaryCircle.radius
            }
        ]
        if (input.secondaryCircle != null) {
            obj.RingTimeStamps.push({
                date: null,
                after: obj.uitloop + input.secondaryCircle.after,
                lat: input.primaryCircle.lat,
                lng: input.primaryCircle.lng,
                rad: input.primaryCircle.radius
            });
        }
        return obj;
    }
}