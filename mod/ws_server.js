import { Server } from "websocket";
import WiFi from "wifi";
import Net from "net";
import Secret from "secret";
import MDNS from "mdns";

const WSServer = function (callback) {

    const ssid = Secret.ssid;
    const password = Secret.password;

    const wifi = new WiFi({ ssid, password }, msg => {
        trace(`wifi msg=${msg}\n`);
        if (msg == "gotIP") {
            trace(`IP=${Net.get("IP")}\n`);
            mdns();
        }
    });

    const mdns = function(){
        let hostName = "spotsg90";
        new MDNS({hostName}, function(message, value) {
          trace(`MDNS: message=${message} value=${value}\n`);
          if (MDNS.hostName === message){
            hostName = value;
            trace(`MDNS: hostName=${hostName}\n`);
          }
        });
    }

    let server = new Server({ port: 80 });
    server.callback = function (message, value) {
        switch (message) {
            case Server.connect:
                trace("WS: connect\n");
                break;

            case Server.handshake:
                trace("WS: handshake\n");
                break;

            case Server.receive:
                //trace(`WS: receive value=${value}\n`);
                const req = JSON.parse(value);
                const resp = {
                    "id": req.id,
                    "cmd": req.cmd
                }
                const response = callback(req.cmd, req.request);
                if(!response){
                    resp["error"] = "unknown";
                }else if(response["ERROR"]){
                    resp["error"] = response["ERROR"];
                }else{
                    resp["response"] = response;
                }
                this.write(JSON.stringify(resp));
                break;

            case Server.disconnect:
                trace("WS: disconnect\n");
                break;
        }
    }
};

export default WSServer;
