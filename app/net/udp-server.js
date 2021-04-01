const dgram = require("dgram"); 
 
let server = dgram.createSocket("udp4");

server.bind(() => { server.setBroadcast(true); setInterval(broadcastGame, 3000); });

const broadcastGame = () => { 
    let message = new Buffer("displayGame"); 
    server.send(message, 0, message.length, 3001, "255.255.255.255");
};