import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';
import OBS from '../OBS.js';
import List from './List.js';
import './FluidInput.js';

export default class SceneTransition extends List {

        static get styles() {
            return css`
                ${super.styles}
                .transition-duration {
                    margin-top: 10px;
                }
                label {
                    font-size: 12px;
                    opacity: 0.5;
                    margin-bottom: 2px;
                }
                gyro-fluid-input {
                    width: 100%;
                    height: 35px;
                }
            `;
        }
    
        constructor() {
            super();

            this.scenes = [];
            this.currentScene = null;
        }

        connectedCallback() {
            this.update();

            OBS.on('transitions', e => {
                this.scenes = OBS.getState().transitions;
                this.update();
            });
        }

        setCurrent(scneName) {
            OBS.setCurrentTransition(scneName);
        }

        setDuration(duration) {
            OBS.setTransitionDuration(duration);
        }
        
        render() {
            const current = OBS.getState().currentTransitions;

            return html`
                <div class="container">
                    <div class="title">Scene Transition</div>
                    <div class="list">
                        ${this.scenes.map(item => {
                            return html`
                                <div class="list-item" 
                                    ?active="${item.name === current.name}"
                                    @click="${e => this.setCurrent(item.name)}">${item.name}</div>
                            `;
                        })}
                    </div>
                </div>

                ${(current && current.duration !== undefined) ? html`
                    <div class="container transition-duration">
                        <label class="title">Dutration</label>
                        <gyro-fluid-input steps="10" 
                                            min="10" 
                                            max="5000" 
                                            suffix="ms" 
                                            @change="${e => this.setDuration(e.target.value)}"
                                            .value="${current.duration}">
                        </gyro-fluid-input>
                    </div>
                ` : ""}
            `;
        }
}

customElements.define('obs-scene-transition', SceneTransition);
