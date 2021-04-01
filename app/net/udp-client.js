const dgram = require('dgram');
let client = dgram.createSocket("udp4");

const PORT = 3001;

client.on("listening", () => {
    client.setBroadcast(true); 
});

client.bind(PORT);

let foundServer = false;

client.on("message", (message, rinfo) => {
    console.log(`Message from: ${rinfo.address}:${rinfo.port}`);
    try {
        const json = JSON.parse(message);
        console.log(`Message: ${JSON.stringify(json)}`);

        switch(json.type) {
            case "pong":
                const roundtrap = Date.now() - (+json.timestamp);
                console.log(`Latency: ${roundtrap / 2}ms`);
                break;
        }

        if(!foundServer) {
            let message = new Buffer(JSON.stringify({
                type: "ping",
                id: Math.floor(Math.random() * 100000000).toString(),
                timestamp: Date.now(),
            }));
            client.send(message, 0, message.length, PORT, rinfo.address);
            console.log('Sent reply');

            foundServer = true;
        }
    } catch(err) {}
});
