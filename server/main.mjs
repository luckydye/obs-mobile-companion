import express from 'express';
import { Server as IoServer } from "socket.io";
import path from 'path';
import VideoFeed from './VideoFeed.mjs';
import Chat from './Chat.mjs';
import http from 'http';

const PORT = process.env.PORT || 3000;

async function main() {
    const app = express();
    const server = http.Server(app);
    const io = new IoServer(server);

    io.on("connection", (socket) => {
        console.log("socket connected");
    });

    app.use('/', express.static(path.resolve('./public')));
    app.use('/', (req, res) => {
        res.sendFile(path.resolve('./public/index.html'));
    });

    console.log('App listening on ' + PORT);
    server.listen(PORT);

    const feed = await VideoFeed.getVideoFeed();
    feed.stdout.on('data', data => {
        io.emit('videofeed', data);
    })

    // chat
    // const chat = new Chat();
    // chat.on('message', msg => {
    //     console.log(msg);
    // })
}

main();
