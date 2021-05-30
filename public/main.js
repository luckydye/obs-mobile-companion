import AudioStreamMeter from './components/LevelMeter.js';
import './components/OBSOutputStatusbar.js';
import './components/OBSPreview.js';
import './components/OBSSceneStatusbar.js';

window.addEventListener('DOMContentLoaded', init);

function init() {
    document.main = document.querySelector("main");

    const audioContext = new AudioContext();
    const meter = new AudioStreamMeter(audioContext, "Master Out");
    document.querySelector('obs-scene-statusbar').append(meter);

    const complete = e => {
        const video = preview.getVideo();
        // meter.setAudioSourceFromMediaElement(video);
        // meter.setLabel(`Master Out (${video.getAudioTracks()[0].label})`);
    }

    const preview = document.querySelector('obs-preview');
    if(preview.ready) {
        complete();
    } else {
        preview.addEventListener('ready', complete)
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', {
        sopce: '/images/'
    }).then(registration => {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
    });
}
