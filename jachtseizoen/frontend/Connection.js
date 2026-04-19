const HANDSHAKE = 60000

class Connection {
    url;
    ws;
    handshakeInterval;

    constructor(url, messageHandler){
        this.url = url;
        this.ws = new WebSocket(url);
        this.ws.onclose = this.onclose.bind(this);
        this.setIncomingMessageHandler(messageHandler);
        this.ws.addEventListener("message", (event) => {
            console.log(event);
        })
        this.handshakeInterval = setInterval(() => this.sendHandshake(), HANDSHAKE);
    }

    retry(){
        this.ws = new WebSocket(this.url);
    }

    onclose(event){
        alert("De verbinding met de server is verbroken: " + event.reason);
        this.retry();
    }

    send(msg){
        this.ws.send(msg);
    }

    sendHandshake(){
        console.log("sending handshake");
        this.ws.send(JSON.stringify({msgType:"handshake", content:{}}));
    }

    setIncomingMessageHandler(handler){
        this.ws.onmessage = handler;
    }

    close(){
        this.ws.close();
    }

    state(){
        return this.ws.readyState;
    }
}