var SRC_PORT = 6025;
var PORT = 6024;
var MULTICAST_ADDR = '239.255.255.250';
var dgram = require('dgram');
var server = dgram.createSocket("udp4");

server.bind(SRC_PORT, function () {         // Add the HOST_IP_ADDRESS for reliability
    setInterval(multicastNew, 4000);
});

function multicastNew() {
    var message = Buffer.from("Multicast message!");
    server.send(message, 0, message.length, PORT, MULTICAST_ADDR, function () {
        console.log("Sent '" + message + "'");
    });
}