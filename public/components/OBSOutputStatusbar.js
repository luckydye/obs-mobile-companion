import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';
import OBS from '../OBS.js';

class OBSOutputStatusbar extends LitElement {

        static get styles() {
            return css`
                :host {
                    display: block;
                    width: 100%;
                    padding: 10px 0;
                    background: rgba(0, 0, 0, 0.25);
                    color: rgb(238, 238, 238);
                    font-size: 0.8em;
                    box-sizing: border-box;
                }
                .container {
                    grid-template-columns: auto auto 1fr auto;
                    box-sizing: border-box;
                    padding: 0 20px;
                }
                .label {
                    font-size: 0.65em;
                    font-weight: bold;
                    margin-right: 5px;
                    color: #b3b3b3;
                    text-transform: uppercase;
                }
                .row {
                    display: grid;
                    grid-auto-flow: column;
                    grid-auto-columns: auto;
                    gap: 25px;
                    justify-content: space-evenly;
                }
                .cell {
                    display: flex;
                    align-items: center;
                }
                .material-icons {
                    font-size: 21px;
                    margin: -2px 5px 0px 5px;
                }
                .status-circle {
                    border-radius: 50%;
                    width: 15px;
                    height: 15px;
                    background: var(--color);
                }
                .status-circle[status="false"] {
                    --color: #c1c1c1;
                }
                .status-circle[status="true"] {
                    --color: #ef2d2d;
                }
                [singal="1"] {
                    color: yellow;
                }
                [singal="2"] {
                    color: red;
                }
                .spacer {
                    margin: 0 4px;
                }
                .cpu {
                    min-width: 60px;
                    text-align: center;
                }
            `;
        }
    
        constructor() {
            super();

            this.state = null;
    
            OBS.on('status', () => {
                this.state = OBS.getState();
                this.update();
            });
        }

        connectedCallback() {
            super.connectedCallback();
        }
        
        render() {
            if(this.state && this.state.stats && this.state.stream && this.state.output) {
                const stats = this.state.stats;
                const stream = this.state.stream;
                const streamStatus = this.state.streamStatus;
                const output = this.state.output;
                const video = this.state.video;

                const format = video.videoFormat.split("_")[2];
                const colorSpace = video.colorSpace.split("_")[2];
                const colorRange = video.colorRange;

                let resIcon = html`<span class="material-icons">hd</span>`;
                if(output['height'] >= 1080) {
                    resIcon = html`<span class="material-icons">high_quality</span>`;
                }
                if(output['height'] >= 3840) {
                    resIcon = html`<span class="material-icons">4k</span>`;
                }

                let signalStrength = 0;
                if(streamStatus) {
                    if(streamStatus['kbits-per-sec'] < 1000) {
                        signalStrength = 2;
                    } else if(streamStatus['kbits-per-sec'] < 5000) {
                        signalStrength = 1;
                    }
                }

                return html`
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

                    <div class="row container">
                        <div class="cell">
                            <span class="label">In</span>
                            ${resIcon}
                            <span>${video['baseHeight']}p</span>
                            <span>${video['fps'].toFixed(2).padStart(2, '0')}</span>
                        </div>
                        <div class="cell">
                            <span class="label">Out</span>
                            ${resIcon}
                            <span>${video['outputHeight']}p</span>
                            <span>${stats['fps'].toFixed(2).padStart(2, '0')}</span>
                        </div>
                        
                        <div class="cell">
                            <span class="label">Encoder</span>
                            <span class="material-icons">developer_board</span>
                            <span class="cpu">${(stats['cpu-usage'] || 0).toFixed(2).padStart(2, "0")}%</span>
                            <span class="material-icons">memory</span>
                            <span>${(stats['memory-usage'] || 0).toFixed(0)}MB</span>
                        </div>
                        <div class="row">
                            <div class="cell">
                                <span class="label">Rec</span>
                                <span class="status-circle" status="${stream['recording']}"></span>
                            </div>
                            <div class="cell">
                                <span class="label">Stream</span>
                                <span class="status-circle" status="${stream['streaming']}"></span>
                            </div>
                        </div>
                        ${(streamStatus && stream['streaming']) ? html`
                            <div class="cell" singal="${signalStrength}">
                                <span class="label">Stream</span>
                                <span class="material-icons">network_check</span>
                                <span>${streamStatus['kbits-per-sec'].toFixed(0).padStart(1, "0")}kb/s</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else {
                return html`
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

                    <div class="row">
                        <div class="cell">
                            <span class="label">Source</span>
                            <span>No Connection</span>
                        </div>
                    </div>
                `;
            }
        }
}

customElements.define('obs-output-statusbar', OBSOutputStatusbar);
