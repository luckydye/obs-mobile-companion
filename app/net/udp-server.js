// Require dgram module.
var dgram = require('dgram');

// Create udp server socket object.
var server = dgram.createSocket("udp4");

// Make udp server listen on port 8089.
server.bind(8089);

// When udp server receive message.
server.on("message", function (message) {
    // Create output message.
    var output = "Udp server receive message : " + message + "\n";
    // Print received message in stdout, here is log console.
    process.stdout.write(output);
});

// When udp server started and listening.
server.on('listening', function () {
    // Get and print udp server listening ip address and port number in log console. 
    var address = server.address(); 
    console.log('UDP Server started and listening on ' + address.address + ":" + address.port);
});