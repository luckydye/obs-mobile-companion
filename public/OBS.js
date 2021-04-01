// localStorage.debug = 'obs-websocket-js:*';

const tickrate = 1000 / 1;
const lokalStatus = {
    currentScene: ""
}

const obs = new OBSWebSocket();
obs.connect({ address: 'localhost:4444' });

obs.on('ConnectionClosed', connectionClosed);
obs.on('ConnectionOpened', connectionOpende);
obs.on('AuthenticationSuccess', authSuccess);
obs.on('AuthenticationFailure', authFailed);

obs.on('SwitchScenes', data => {
    lokalStatus.currentScene = data.sceneName;
});

function log(...args) {
    console.log('[OBS]', ...args);
}

function authFailed() {
    log('Connection auth failed');
}

function authSuccess() {
    log('Connection auth success');
}

function connectionClosed() {
    log('Connection closed');
}

let statusInterval;

function connectionOpende() {
    log('Connection opened');

    obs.send('GetCurrentScene').then(data => {
        lokalStatus.currentScene = data.name;
        OBS.emit('status');
    })

    const reqUpdate = () => {
        obs.send('ListOutputs').then(data => {
            for(let output of data.outputs) {
                if(output.name == "VirtualOutput") {
                    lokalStatus.output = output;
                }
            }
            OBS.emit('status');
        })
        obs.send('GetStats').then(data => {
            lokalStatus.stats = data.stats;
            OBS.emit('status');
        })
        obs.send('GetVideoInfo').then(data => {
            lokalStatus.video = data;
            OBS.emit('status');
        })
        obs.send('GetStreamingStatus').then(data => {
            lokalStatus.stream = data;
            OBS.emit('status');
        })
    }

    obs.on('StreamStatus', data => {
        lokalStatus.streamStatus = data;
        OBS.emit('status');
    })
    
    statusInterval = setInterval(reqUpdate, tickrate);
    reqUpdate();
}

const listeners = {};

export default class OBS {

    static getState() {
        return lokalStatus;
    }

    static emit(event) {
        listeners[event] = listeners[event] || [];
        for(let callback of listeners[event]) {
            callback();
        }
    }

    static on(event, callback) {
        listeners[event] = listeners[event] || [];
        const listenrIndex = listeners[event].push(callback);
        const cancel = () => {
            listeners[event].splice(listenrIndex, 1);
        }
        return cancel;
    }

}
