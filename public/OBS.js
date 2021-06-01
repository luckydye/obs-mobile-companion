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

async function connectionOpende() {
    log('Connection opened');

    obs.send('GetCurrentScene').then(data => {
        lokalStatus.currentScene = data.name;
        OBS.emit('scenes');
    })

    await obs.send('GetSourceTypesList').then(data => {
        lokalStatus.types = data.types;
    });

    const reqUpdate = () => {
        // scenes
        obs.send('GetSceneList').then(data => {
            lokalStatus.scenes = data.scenes;
            OBS.emit('scenes');
        }),

        obs.send('GetSourcesList').then(async data => {
            lokalStatus.sources = data.sources;

            for(let source of data.sources) {
                const typesId = source.typeId;
                let hasAudio = false;
                let hasVideo = false;

                for(let type of lokalStatus.types) {
                    if(type.typeId == typesId) {
                        hasAudio = type.caps.hasAudio;
                        hasVideo = type.caps.hasVideo;
                    }
                }

                const name = source.name;
                const volume = await obs.send('GetVolume', {
                    source: name,
                }).then(data => data.volume);
                const muted = await obs.send('GetMute', {
                    source: name,
                }).then(data => data.muted);
                const monitorType = await obs.send('GetAudioMonitorType', {
                    sourceName: name,
                }).then(data => data.monitorType);

                const settings = await obs.send('GetSourceSettings', {
                    sourceName: name,
                }).then(data => data.sourceSettings);

                source.settings = settings;
                source.monitorType = monitorType;
                source.volume = volume;
                source.muted = muted;
                source.hasAudio = hasAudio;
                source.hasVideo = hasVideo;
            }

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

    obs.on('SourceVolumeChanged', ({ sourceName, volume }) => {
        for(let source of lokalStatus.sources) {
            if(source.name == sourceName) {
                source.volume = volume;
            }
        }
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

    static setVolume(sourceName, volume) {
        return obs.send('SetVolume', {
            'source': sourceName,
            'volume': volume,
            'useDecibel': false,
        });
    }

    static setMute(sourceName, muted) {
        return obs.send('SetMute', {
            'source': sourceName,
            'mute': muted,
        });
    }

    static setAudioMonitorType(sourceName, monitorType) {
        return obs.send('SetAudioMonitorType', {
            'sourceName': sourceName,
            'monitorType': monitorType,
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
