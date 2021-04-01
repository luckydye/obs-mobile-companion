const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const ws = require('ws');
const { OBS } = require('./OBS.js');

const expressServer = express();
const PORT = 4848;

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
    console.log('Socket connected');
    socket.on('message', message => {
        handleSocketMessage(socket, JSON.parse(message));
    });
});

const server = expressServer.listen(PORT);

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});

// electron

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 640,
        title: "OBS Companion",
        autoHideMenuBar: true,
        backgroundColor: 0x333,
        titleBarStyle: "default",
        center: false,
        webPreferences: {
            preload: path.join(app.getAppPath(), '../public/udp-client.js'),
            devTools: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            webSecurity: false
        }
    })

    win.loadFile('../public/index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
