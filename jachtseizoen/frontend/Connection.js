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
        this.handshakeInterval = setInterval(() => this.sendHandshake(), HANDSHAKE);
    }

    /**
     * Clears the old WS, initializes a new one. 
     * Sends any queued messages in the order they were meant to be sent
     */
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
    }

    /**
     * Retry establishing a connection
     */
    retry(){
        this.initialize();
    }

    /**
     * General close event handler. Retries after user confirms alert.
     * @param {Event} event 
     */
    onclose(event){
        // alert("De verbinding met de server is verbroken: " + event.reason);
        this.retry();
    }

    /**
     * Sends message, if WS is ready to send. Otherwise msg gets queued.
     * @param {*} msg
     * @param {Boolean} queue indicates whether the message should be queued if connection is not open, defaults to true
     */
    send(msg, queue = true){
        if(this.ws.readyState != WebSocket.OPEN){
            if(!queue) return;
            this.queue.push(msg);
            return;
        }
        this.ws.send(msg);
    }

    /**
     * Sends an empty handshake message to keep DO alive.
     */
    sendHandshake(){
        if(this.ws.readyState != WebSocket.OPEN) return;
        console.log("sending handshake");
        this.send(JSON.stringify({msgType:"handshake", content:{}}), false);
    }

    /**
     * 
     * @param {Function} handler 
     */
    setIncomingMessageHandler(handler){
        this.customMessageHandler = handler;
        this.ws.onmessage = handler;
    }

    /**
     * Closes the WS connection
     */
    close(){
        this.ws.close();
    }

    /**
     * returns the WebSocket.readyState property of the websocket.
     * @returns {Integer} readyState
     */
    state(){
        return this.ws.readyState;
    }
}