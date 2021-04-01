const dgram = require("dgram");
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
 
const PORT = 3001;
const lokalIpAddress = getIP4Address('Ethernet');

let server = dgram.createSocket("udp4");

server.bind(PORT, () => { 
    server.setBroadcast(true);
    setInterval(broadcast, 3000);
});

server.on("message", handleMessage);

function broadcast() { 
    let message = new Buffer(JSON.stringify({
        message: "Testing UDP braodcast."
    })); 
    server.send(message, 0, message.length, PORT, "255.255.255.255");
    console.log('Sent broadcast message.');
}

function handleMessage(message, rinfo) {
    if(rinfo.address !== lokalIpAddress) {
        console.log(`Message from: ${rinfo.address}:${rinfo.port} - ${message}`);

        try {
            // reply to message types
            const reply = JSON.parse(message);

            switch(reply.type) {
                case "ping":
                    const message = new Buffer(JSON.stringify({
                        type: 'pong',
                        id: reply.id,
                        timestamp: reply.timestamp,
                    })); 
                    server.send(message, 0, message.length, PORT, rinfo.address);
                    break;
            }
        } catch(err) {}
    }
}

function getIP4Address(adapter) {
    const results = Object.create(null);
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results[adapter][0];
}
