import { html, LitElement } from 'https://cdn.pika.dev/lit-element';

function splitAudioSourceChannels(audioContext, source) {
    const splitter = audioContext.createChannelSplitter(source.channelCount);
    source.connect(splitter);

    const outputs = [];
    for(let i = 0; i < splitter.channelCount; i++) {
        const gain = audioContext.createGain();
        gain.out = true;
        splitter.connect(gain, i);
        outputs[i] = gain;
    }

    return outputs;
}

export default class AudioStreamMeter extends LitElement {

    constructor(context, name) {
        super();

        this.name = name;
        this.audioContext = context;

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.maxDecibels = 6;
        this.analyser.minDecibels = -60;
        this.analyser.smoothingTimeConstant = 0;
        this.dbRange = this.analyser.maxDecibels - this.analyser.minDecibels;
        this.dataArray = new Float32Array(this.analyser.frequencyBinCount);

        this.canvas = document.createElement('canvas');
        this.canvas.width = 150;
        this.canvas.height = 4;
        this.context = this.canvas.getContext("2d");
        this.value = 0;
        this.target = 0;
        this.peak = 0;
        this.history = [];

        this.channels = [];

        const updateAudioMeter = () => {
            this.evaluate();
            this.renderAudioMeter();
            requestAnimationFrame(updateAudioMeter);
        }
        updateAudioMeter();
    }

    setSourceStream(stream) {
        const audioSource = this.audioContext.createMediaStreamSource(stream);
        this.setAudioSourceNode(audioSource);
    }

    setAudioSourceNode(audioSourceNode) {
        this.channels = [];

        if(audioSourceNode.channelCount > 1 && !audioSourceNode.out) {
            const channels = splitAudioSourceChannels(this.audioContext, audioSourceNode);
            
            for(let channel of channels) {
                console.log('CHANNEL', channel);
                const meter2 = new AudioStreamMeter(this.audioContext);
                meter2.setAudioSourceNode(channel);
                this.channels.push(meter2);
            }
        } else {
            this.audioSource = audioSourceNode;
            this.audioSource.connect(this.analyser);
            this.evaluate();
        }
    }

    setAudioSourceFromTrack(audioTrack) {
        const stream = new MediaStream();
        stream.addTrack(audioTrack);
        this.setSourceStream(stream);
    }

    setAudioSourceFromMediaElement(element) {
        const source = this.audioContext.createMediaElementSource(element);
        this.setAudioSourceNode(source);
    }

    setLabel(str) {
        this.name = str;
        this.update();
    }

    evaluate() {
        this.analyser.getFloatFrequencyData(this.dataArray);

        let avrg = 0;
        for(let value of this.dataArray) {
            avrg += value;
        }
        avrg = avrg / this.dataArray.length;

        this.target = avrg;

        if(Number.isFinite(this.target)) {
            this.value += (this.target - this.value) * 0.033;
        }

        this.history.push(this.target);
        if(this.history.length > 50) {
            this.history.shift();
        }

        this.peak = Math.max(...this.history);
    }

    renderAudioMeter() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const factor = this.dbRange;
        const value = (this.dbRange - Math.abs(this.value + this.dbRange)) / factor;
        const target = (this.dbRange - Math.abs(this.target + this.dbRange)) / factor;
        const peak = (this.dbRange - Math.abs(this.peak + this.dbRange)) / factor;

        this.context.fillStyle = "#1a8e1a";
        this.context.fillRect(0, 0, target * this.canvas.width, this.canvas.height);

        this.context.fillStyle = "#00ff00";
        this.context.fillRect(0, 0, value * this.canvas.width, this.canvas.height);

        if(peak < 1) {
            this.context.fillStyle = "#00ff00";
        } else {
            this.context.fillStyle = "red";
        }
        this.context.fillRect(peak * this.canvas.width, 0, 1, this.canvas.height);

        this.update();
    }

    render() {
        return html`
            <style>
                :host {
                    display: block;
                }
                .name {
                    margin-bottom: 5px;
                }
                canvas {
                    image-rendering: pixelated;
                    width: 100%;
                    height: 3px;
                    display: block;
                    margin-bottom: 1px;
                    background: rgba(0, 0, 0, 0.25);
                }
            </style>
            ${this.name ? html`
                <div class="name">${this.name}</div>
            ` : ""}
            ${this.channels.length > 0 ? 
                html`<div>${this.channels}</div>` : 
                html`<div>${this.canvas}</div>`
            }
        `;
    }

}

customElements.define('audio-stream-meter', AudioStreamMeter);