const HANDSHAKE = 60000

class Connection {
    url;
    ws;
    handshakeInterval;
    customMessageHandler;
    queue;

    constructor(url, messageHandler){
        this.url = url;
        this.customMessageHandler = messageHandler;
        this.initialize();
        this.queue = [];
    }

    initialize(){
        this.ws = new WebSocket(this.url);
        this.ws.onopen = ((event) => {
            while(this.queue.length > 0){
                let msg = this.queue.shift();
                this.send(msg);
            }
        }).bind(this);
        this.ws.onclose = this.onclose.bind(this);
        this.setIncomingMessageHandler(this.customMessageHandler);
        this.ws.addEventListener("message", (event) => {
            console.log(event);
        });
        this.handshakeInterval = setInterval(() => this.sendHandshake(), HANDSHAKE);
    }

    retry(){
        this.initialize();
    }

    onclose(event){
        alert("De verbinding met de server is verbroken: " + event.reason);
        this.retry();
    }

    send(msg){
        if(this.ws.readyState != WebSocket.OPEN){
            this.queue.push(msg);
            return;
        }
        this.ws.send(msg);
    }

    sendHandshake(){
        if(this.ws.readyState != WebSocket.OPEN) return;
        console.log("sending handshake");
        this.ws.send(JSON.stringify({msgType:"handshake", content:{}}));
    }

    setIncomingMessageHandler(handler){
        this.customMessageHandler = handler;
        this.ws.onmessage = handler;
    }

    close(){
        this.ws.close();
    }

    state(){
        return this.ws.readyState;
    }
}