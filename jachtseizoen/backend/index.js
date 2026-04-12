import { GameDO } from "./game-do.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Expect: /ws/<gameId>
    if (url.pathname.startsWith("/ws/")) {
      const gameId = url.pathname.split("/")[2];
      return handleWS(request, env, gameId);
    }

    return new Response("OK");
  }
};

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

export { GameDO };