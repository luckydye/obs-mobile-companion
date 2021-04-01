var PORT = 4003;
var MULTICAST_ADDR = '224.0.0.255';
var dgram = require('dgram');
var client = dgram.createSocket('udp4');

client.on('listening', function () {
    var address = client.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
});

client.on('message', function (message, rinfo) {
    console.log('Message from: ' + rinfo.address + ':' + rinfo.port + ' - ' + message);
});

client.bind(PORT, function () {
    client.addMembership(MULTICAST_ADDR);   // Add the HOST_IP_ADDRESS for reliability
});