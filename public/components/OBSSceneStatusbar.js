import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';
import OBS from '../OBS.js';

class OBSSceneStatusbar extends LitElement {

        static get styles() {
            return css`
                :host {
                    display: block;
                    width: 100%;
                    padding: 10px 0;
                    background: rgba(0, 0, 0, 0.25);
                    color: rgb(238, 238, 238);
                    font-size: 1em;
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
            if(this.state) {
                return html`
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

                    <div class="row container">
                        <div class="cell">
                            <span class="label">Scene</span>
                            <span>${this.state.currentScene}</span>
                        </div>
                        <div class="cell">
                            <slot></slot>
                        </div>
                    </div>
                `;
            } else {
                return html`
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

                    <div class="row">
                        <div class="cell">
                            <span class="label">Scene</span>
                        </div>
                        <div class="cell">
                            <slot></slot>
                        </div>
                    </div>
                `;
            }
        }
}

customElements.define('obs-scene-statusbar', OBSSceneStatusbar);
