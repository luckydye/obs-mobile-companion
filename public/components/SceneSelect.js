import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';
import OBS from '../OBS.js';
import List from './List.js';

export default class SceeneSelect extends List {
    
        constructor() {
            super();

            this.scenes = [];
            this.currentScene = null;
        }

        connectedCallback() {
            this.update();

            OBS.on('scenes', e => {
                this.scenes = OBS.getState().scenes || [];
                this.update();
            });
        }

        setCurrentScene(scneName) {
            OBS.setCurrentScene(scneName);
        }
        
        render() {
            const currentScene = OBS.getState().currentScene;

            return html`
                <div class="container">
                    <div class="title">Scene Switcher</div>
                    <div class="list">
                        ${this.scenes.map(scene => {
                            return html`
                                <div class="list-item" 
                                    ?active="${scene.name === currentScene}"
                                    @click="${e => this.setCurrentScene(scene.name)}">${scene.name}</div>
                            `;
                        })}
                    </div>
                </div>
            `;
        }
}

customElements.define('obs-scene-selector', SceeneSelect);
