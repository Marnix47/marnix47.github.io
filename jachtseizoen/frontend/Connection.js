const HANDSHAKE = 60000

class Connection {
    ws;
    handshakeInterval;

    constructor(url){
        this.ws = new WebSocket(url);
        this.ws.onclose = onclose;
        this.handshakeInterval = setInterval(this.sendHandshake, HANDSHAKE);
    }

    retry(){

    }

    onclose(event){
        alert("De verbinding met de server is verbroken: " + event.reason);
    }

    send(msg){
        this.ws.send(msg);
    }

    sendHandshake(){
        this.send(JSON.stringify({msgType:"handshake", content:{}}));
    }

    setIncomingMessageHandler(handler){
        this.ws.onmessage = handler;
    }
}