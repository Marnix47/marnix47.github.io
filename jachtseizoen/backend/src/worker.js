import { GameDO } from "./game-do.js";
import { IdGenerator } from "./IdGenerator.js";

const HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        console.log("NEW REQUEST RECEIVED");
        // console.log(JSON.parse(await request.text()));
        // Expect: /ws/<gameId>
        if(request.method == "OPTIONS"){
            return new Response("OK", {status:200, headers:HEADERS});
        }
        if (url.pathname.startsWith("/ws/")) {
            const gameId = url.pathname.split("/")[2];
            return handleWS(request, env, gameId);
        }

        if (url.pathname.startsWith("/newgame")) {
            try{
                return handleNewGame(request, env);
            } catch {
                return new Response("BAD REQUEST", {status: 400, headers:HEADERS})
            }
        }

        return new Response("OK");
    }
};

/**
 * 
 * @param {*} request 
 * @param {*} env 
 * @param {*} gameId 
 * @returns 
 */
async function handleWS(request, env, gameId) {
    if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const id = env.GAME_DO.idFromName(gameId);
    const stub = env.GAME_DO.get(id);

    // Forward the WebSocket to the Durable Object
    await stub.fetch("https://internal/ws", {
        method: "POST",
        body: server,
        headers: { "Upgrade": "websocket" }
    });

    return new Response(null, { status: 101, webSocket: client });
}

/**
 * 
 * @param {*} env 
 * @returns {Number} New id
 */
async function generateId(env){
    const id = env.ID_GENERATOR.idFromName("global") // one global counter
    const stub = env.ID_GENERATOR.get(id)

    const resp = await stub.fetch("https://dummy/")
    const newId = parseInt(await resp.text(), 10)

    return newId;
}

async function handleNewGame(request, env) {
    //extract data from request
    return initializeGameDO(JSON.parse(await request.text()), env);
}

/**
    * 
    * @param {{duration: seconds, interval: seconds, uitloop: seconds, lowerIntervalAfter: {interval: seconds, after: seconds}, player: string, primaryCircle: {lat: Long, lng: Long, radius: meters}, secondaryCircle: {lat: Long, lng: Long, radius: meters, after: seconds}}} data
    * @param {{id: Number, start: Date, end: Date, duration: seconds, interval: seconds, uitloop: seconds, lowerIntervalAfter: {interval: seconds, after: seconds}, persons: Person[], locationUpdateTimeStamps: Date[], RingTimeStamps: {date: Date, lat: Long, lng: Long, rad:meters}[]}}
    * @param {*} env 
    // * @return {Number|Null} created ID iff succes, null otherwise
    * @return {Response} the response from the DO
*/
async function initializeGameDO(data, env) {
    const gameId = await generateId(env);
    console.log(gameId);
    const DOid = env.GAME_DO.idFromName(gameId);
    const stub = env.GAME_DO.get(DOid);

    const resp = await stub.fetch("https://internal.com/new-game/" + gameId, {
        method: "POST",
        body: JSON.stringify(data)
    });
    console.log(resp);
    return resp;
}

export { GameDO , IdGenerator};