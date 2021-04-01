const dgram = require("dgram"); 
 
let server = dgram.createSocket("udp4");

server.bind(() => { server.setBroadcast(true); setInterval(broadcast, 3000); });

const broadcast = () => { 
    let message = new Buffer(JSON.stringify({
        timestamp: Date.now(),
        message: "Testing UDP braodcast."
    })); 
    server.send(message, 0, message.length, 3001, "255.255.255.255");
    console.log('Sent broadcast message.');
};
