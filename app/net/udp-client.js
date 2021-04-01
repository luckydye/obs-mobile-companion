let client = dgram.createSocket("udp4");

client.on("listening", () => { client.setBroadcast(true); });

client.bind(3001);

client.on("message", (message, rinfo) => {
    console.log(`Message from: ${rinfo.address}:${rinfo.port} - ${message}`); 
});