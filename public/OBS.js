// localStorage.debug = 'obs-websocket-js:*';

const tickrate = 1000 / 12;
const lokalStatus = {
    currentScene: ""
}

const obs = new OBSWebSocket();
obs.connect({ address: location.hostname + ':4444' });

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
        OBS.emit('scenes');
    })

    const reqUpdate = () => {
        // scenes
        obs.send('GetSceneList').then(data => {
            lokalStatus.scenes = data.scenes;
            OBS.emit('scenes');
        }),

        obs.send('GetSourcesList').then(data => {
            lokalStatus.sources = data.sources;
            OBS.emit('sources');
        }),
        
        // status
        Promise.all([
            obs.send('ListOutputs').then(data => {
                for(let output of data.outputs) {
                    if(output.name == "VirtualOutput") {
                        lokalStatus.output = output;
                    }
                }
            }),
            obs.send('GetStats').then(data => {
                lokalStatus.stats = data.stats;
            }),
            obs.send('GetVideoInfo').then(data => {
                lokalStatus.video = data;
            }),
            obs.send('GetStreamingStatus').then(data => {
                lokalStatus.stream = data;
            })
        ]).finally(() => {
            OBS.emit('status');
        })

        // transitions
        Promise.all([
            obs.send('GetTransitionList').then(data => {
                lokalStatus.transitions = data.transitions;
            }),
            obs.send('GetCurrentTransition').then(data => {
                lokalStatus.currentTransitions = data;
            })
        ]).finally(() => {
            OBS.emit('transitions');
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

    static setCurrentScene(scaneName) {
        return obs.send('SetCurrentScene', {
            'scene-name': scaneName
        });
    }
    
    static setCurrentTransition(transitionName) {
        return obs.send('SetCurrentTransition', {
            'transition-name': transitionName
        });
    }
    
    static setTransitionDuration(ms) {
        return obs.send('SetTransitionDuration', {
            'duration': ms
        });
    }

    static setTransition(scaneName) {
        return obs.send('SetCurrentScene', {
            'scene-name': scaneName
        });
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
