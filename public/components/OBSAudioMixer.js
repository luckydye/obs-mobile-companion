import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';
import OBS from '../OBS.js';
import List from './List.js';
import './ToggleButton.js';

export default class AudioMixer extends List {

    constructor() {
        super();
    }

    connectedCallback() {
        this.update();

        OBS.on('audiomixer', e => {
            this.update();
        });
    }

    static get styles() {
        return css`
            ${super.styles}
            .list {
                display: grid;
                grid-auto-flow: column;
                width: 400px;
                justify-content: flex-start;
            }
            .list-item {

            }
            .mute-btn {
                
            }
            toggle-button {
                width: auto;
                height: auto;
                padding: 4px;
                border-radius: 6px;
                background: #313131;
                border: 1px solid #333;
            }
            toggle-button[checked] {
                background: #1c1c1c;
            }
            toggle-button:hover {
                background: #272727;
            }
            toggle-button:active {
                background: rgb(50, 50, 50);
            }
            .mute-btn::after {
                content: "volume_up";
            }
            .mute-btn[checked]::after {
                content: "volume_off";
            }

            .monitor-btn::after {
                content: "headset_off";
            }
            .monitor-btn[checked]::after {
                content: "headset_mic";
            }

            .buttons {
                display: grid;
                gap: 10px;
                grid-auto-flow: column;
                justify-content: center;
                align-items: center;
                margin: 0;
            }
            .column {
                text-align: center;
                margin: 2px;
                background: rgb(42 42 42 / 50%);
                border-radius: 4px;
                padding: 8px;
            }

            .label {
                font-size: 14px;
                margin: 0px;
                width: 80px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .level-slider {
                padding: 10px 0;
            }

            input {
                -webkit-appearance: slider-vertical;
                width: 40px;
                height: 200px;
            }
        `;
    }

    render() {
        const sources = OBS.getState().sources || [];
        return html`
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

            <div class="container">
                <div class="title">Audio Mixer</div>
                <div class="list">
                    ${sources.reverse().map(source => {
                        if(!source.hasAudio) {
                            return;
                        }
                        const monitoring = source.monitorType === "monitorAndOutput";
                        return html`
                            <div class="column">
                                <div class="label">
                                    ${source.name}
                                </div>
                                <div class="level-slider">
                                    <input type="range" orient="vertical" min="0" max="1" step="0.01" 
                                            @input="${e => {
                                                OBS.setVolume(source.name, e.target.valueAsNumber);
                                            }}"
                                            .value="${source.volume}"/>
                                </div>
                                <div class="buttons">
                                    <toggle-button ?checked="${source.muted}" 
                                                    @change="${e => { OBS.setMute(source.name, e.target.checked) }}"
                                                    class="material-icons mute-btn"></toggle-button>

                                    <toggle-button ?checked="${monitoring}" 
                                                    @change="${e => { OBS.setAudioMonitorType(source.name, monitoring ? "none" : "monitorAndOutput") }}"
                                                    class="material-icons monitor-btn"></toggle-button>
                                </div>
                            </div>
                        `;
                    })}
                </div>
            </div>
        `;
    }
}

customElements.define('obs-audio-mixer', AudioMixer);
