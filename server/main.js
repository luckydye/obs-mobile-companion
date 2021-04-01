const express = require('express');
const ws = require('ws');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

const recievers = [];
const senders = [];

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
    console.log('Socket connected');
    socket.on('message', message => {
        handleSocketMessage(socket, JSON.parse(message));
    });
});

function broadcastAllSenders() {
    const sendersIces = senders.map(socket => socket.ice);
    const data = JSON.stringify({
        type: 'senders',
        data: sendersIces
    });
    for(let reciever of recievers) {
        reciever.send(data);
    }
}

function handleSocketMessage(socket, msg) {
    let data = {};
    switch(msg.type) {
        case "register":
            data = msg.data;
            if(data.clientType == "reciever") {
                recievers.push(socket);
                broadcastAllSenders();
            } else if(data.clientType == "sender") {
                senders.push(socket);
            }
            break;
        case "broadcast":
            data = msg.data;
            console.log(data);
            break;
        case "ice":
            data = msg.data;
            socket.ice = data.ice;
            console.log('Recieved sender ice');
            break;
        case "peerConnect":
            data = msg.data;
            const ice = data.ice;
            const answer = data.answer;

            for(let sender of senders) {
                if(JSON.stringify(sender.ice) == JSON.stringify(ice)) {
                    sender.send(JSON.stringify({
                        type: 'connectToReciever',
                        data: {
                            answer: answer
                        }
                    }));
                }
            }
            break;
    }
}

app.use('/', express.static(path.join(__dirname, '../public')));
app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const server = app.listen(PORT);
console.log('Server listening on', PORT);

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});
