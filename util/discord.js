const WebSocket = require('ws');
const chalk = require('chalk');

module.exports = class Discord {
    constructor() {
        //this.token = token;
        this.heartbeatInterval = null;
        
        //this.gatewayURL = "wss://gateway.discord.gg/?v=6&encoding=json";
        /*this.endpoint = endpoint;
        this.sessionID = sessionID;
        this.token = token;*/
        this.heartbeatInterval = null;
        this.ssrc = null;
        this.ip = null;
        this.port = null;
        this.modes = [];
    }

    connect(sessionID,token,endpoint) {
        const ws = new WebSocket(endpoint);

        ws.on('open', () => {
            console.log(`${chalk.red('[WebSocket]')} Connecting to Discord websocket...`);
        });
        ws.on('message', (d) => {
            const data = JSON.parse(d);
            switch(data.op) {
                case 2: {
                    
                    break;
                }
            }
        });
    }

    heartbeat() {

    }
}