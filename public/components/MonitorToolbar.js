import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';
import OBS from '../OBS.js';

window.OBS = OBS;

export default class MonitorToolbar extends LitElement {

        static get styles() {
            return css`
                :host {
                    display: flex;
                    height: 100%;
                    align-items: center;
                    z-index: 10000;
                    color: #eee;
                    padding: 50px 0;
                    box-sizing: border-box;
                }
                .tabs {
                    padding: 2px;
                    border-radius: 16px;
                    background: rgb(0 0 0 / 75%);
                    backdrop-filter: blur(8px);
                    display: grid;
                    grid-gap: 4px;
                    grid-auto-flow: row;
                    align-items: center;
                    justify-content: center;
                }
                .tab {
                    position: relative;
                    background: #eeeeee2e;
                    border-radius: 12px;
                    width: 60px;
                    height: 60px;
                    padding: 10px;
                    box-sizing: border-box;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: background .125s ease-out, border .125s ease-out;
                    border: 1px solid black;
                    z-index: 1000;
                }
                .tab[active] {
                    background: rgb(255 255 255 / 25%);
                    border: 1px solid #333;
                }
                .tab:active {
                    transition: none;
                    background: rgb(153 153 153 / 18%);
                }
                slot {
                    z-index: 10;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: auto;
                    height: 100%;
                    position: absolute;
                    right: 120%;
                    top: 0px;
                    transition: clip-path 0.125s cubic-bezier(0.42, 0, 0.06, 0.98) 0s, 
                                -webkit-clip-path 0.125s cubic-bezier(0.42, 0, 0.06, 0.98) 0s,
                                transform .1s ease-out;

                    clip-path: circle(0.0% at 100% 51%);
                    -webkit-clip-path: circle(0.0% at 100% 51%);
                    transform: translate(15px, 0);
                }
                :host([open]) slot {
                    transition: clip-path 0.25s cubic-bezier(0.42, 0, 0.06, 0.98) 0s, 
                                -webkit-clip-path 0.25s cubic-bezier(0.42, 0, 0.06, 0.98) 0s,
                                transform .125s ease-out;

                    clip-path: circle(200.0% at 100% 50%);
                    -webkit-clip-path: circle(200.0% at 100% 50%);
                    transform: translate(0, 0);
                }

                :host([left]) slot {
                    right: auto;
                    left: 120%;
                    clip-path: circle(0.5% at 0 50%);
                    -webkit-clip-path: circle(0.5% at 0 50%);
                    transform: translate(-15px, 0);
                }
                :host([left][open]) slot {
                    clip-path: circle(200.0% at 0 50%);
                    -webkit-clip-path: circle(200.0% at 0 50%);
                    transform: translate(0, 0);
                }
            `;
        }
    
        constructor() {
            super();

            this.activeTab = -1;

            this.update();

            const slot = this.shadowRoot.querySelector('slot');
            slot.addEventListener('slotchange', e => {
                this.update();
                this.updateTabs();
            });
        }

        connectedCallback() {
            this.update();
        }

        updateTabs() {
            let index = 0;
            for(let child of this.children) {
                child.removeAttribute('active');
                child.setAttribute('hidden', '');

                if(index == this.activeTab) {
                    child.removeAttribute('hidden');
                    child.setAttribute('active', '');
                }

                index++;
            }
        }

        selectTab(tabIndex) {
            if(this.activeTab === tabIndex) {
                this.activeTab = -1;
            } else {
                this.activeTab = tabIndex;
            }

            if(this.activeTab === -1) {
                this.removeAttribute('open');
            } else {
                this.setAttribute('open', '');
            }

            this.update();
            this.updateTabs();
        }
        
        render() {
            return html`
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
                <div class="tabs">
                    ${[...this.children].map((child, i) => {
                        return html`
                            <div class="tab" @click="${e => this.selectTab(i)}" ?active="${this.activeTab === i}">
                                <span class="material-icons">${child.getAttribute('icon')}</span>
                            </div>
                        `;
                    })}
                </div>
                <slot></slot>
            `;
        }
}

customElements.define('monitor-toolbar', MonitorToolbar);
