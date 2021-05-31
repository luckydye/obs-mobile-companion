import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';
import OBS from '../OBS.js';
import List from './List.js';

export default class SourcesList extends List {
    
        constructor() {
            super();

            this.sources = [];
        }

        connectedCallback() {
            this.update();

            OBS.on('sources', e => {
                this.sources = OBS.getState().sources || [];
                this.update();
            });
        }

        setCurrentScene(scneName) {
            OBS.setCurrentScene(scneName);
        }
        
        render() {
            return html`
                <div class="container">
                    <div class="title">Sources</div>
                    <div class="list">
                        ${this.sources.map(source => {
                            return html`
                                <div class="list-item">${source.name}</div>
                            `;
                        })}
                    </div>
                </div>
            `;
        }
}

customElements.define('obs-sources', SourcesList);
