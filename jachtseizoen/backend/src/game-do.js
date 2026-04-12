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
          try { ws.send(msg); } catch {}
        }
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("GameDO alive");
  }
}