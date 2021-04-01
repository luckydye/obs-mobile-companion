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

    const preview = document.querySelector('obs-preview');
    preview.addEventListener('ready', e => {
        const stream = preview.getStream();
        console.log(stream);
        meter.setSourceStream(stream);
        meter.setLabel(`Master Out (${stream.getAudioTracks()[0].label})`);
    })
}
