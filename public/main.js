import AudioStreamMeter from './components/LevelMeter.js';
import './components/OBSOutputStatusbar.js';
import './components/OBSPreview.js';
import './components/OBSSceneStatusbar.js';
import './components/MonitorToolbar.js';
import './components/SceneSelect.js';
import './components/SceneTransition.js';
import './components/ChatWindow.js';
import './components/OBSSourcesList.js';
import './components/OBSAudioMixer.js';

window.addEventListener('DOMContentLoaded', init);

let resetTime = null;
function showTools() {
    clearTimeout(resetTime);

    document.body.removeAttribute('minmal');

    resetTime = setTimeout(() => {
        if(document.querySelectorAll('monitor-toolbar[open]').length > 0) {
            showTools(); 
        } else {
            hideTools();
        }
    }, 3000);
}

function hideTools() {
    document.body.setAttribute('minmal', '');
}

function init() {
    document.main = document.querySelector("main");

    const audioContext = new AudioContext();
    const meter = new AudioStreamMeter(audioContext, "Master Out");
    document.querySelector('obs-scene-statusbar').append(meter);

    window.addEventListener('click', e => {
        audioContext.resume();
        showTools();
    });

    showTools();

    const preview = document.querySelector('obs-preview');

    preview.addEventListener('stream', e => {
        meter.setSourceStream(preview.stream);
        meter.setLabel(`Master Out`);
    })
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
