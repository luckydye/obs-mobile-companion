import express from 'express';
import { Server as IoServer } from "socket.io";
import path from 'path';
import VideoFeed from './VideoFeed.mjs';
import Chat from './Chat.mjs';
import http from 'http';
import rtcClient from './Puppet.mjs';
import { v4 as uuidv4 } from 'uuid';

const PORT = process.env.PORT || 3000;

async function main() {
    const app = express();
    const server = http.Server(app);
    const io = new IoServer(server);

    let boradcaster = null;

    const requests = {};

    io.on("connection", (socket) => {
        console.log("socket connected");

        socket.on("message", (type, data) => {
            switch(type) {
                case 'requestPreview':
                    const reqid = uuidv4();
                    requests[reqid] = description => {
                        socket.send('previewOffer', { description, id: reqid });
                    }
                    boradcaster.send('createOffer', { id: reqid });
                    break;
                case 'offer':
                    if(requests[data.id]) {
                        requests[data.id](data.description);
                    }
                    break;
                case 'answer':
                    boradcaster.send('answer', data);
                    break;
                case 'boradcast':
                    boradcaster = socket;
                    console.log("got broadcast");
                    break;
            }
        });
    });

    rtcClient();


    app.use('/', express.static(path.resolve('./public')));
    app.use('/', (req, res) => {
        res.sendFile(path.resolve('./public/index.html'));
    });

    console.log('App listening on ' + PORT);
    server.listen(PORT);

    // chat
    // const chat = new Chat();
    // chat.on('message', msg => {
    //     console.log(msg);
    // })
}

main();
