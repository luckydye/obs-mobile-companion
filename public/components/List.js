import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';
import OBS from '../OBS.js';
import ToolbarContainer from './ToolbarContainer.js';

export default class List extends ToolbarContainer {

        static get styles() {
            return css`
                ${super.styles}
                .list {
                    max-height: 100%;
                    overflow: auto;
                    box-sizing: border-box;
                    width: 200px;
                }
                .list-item {
                    width: 100%;
                    height: 40px;
                    margin-bottom: 2px;
                    color: rgb(238, 238, 238);
                    display: flex;
                    justify-content: flex-start;
                    padding: 0 20px;
                    box-sizing: border-box;
                    align-items: center;
                    border-radius: 6px;
                    position: relative;
                }
                .list-item:not(:last-child)::after {
                    content: "";
                    position: absolute;
                    top: calc(100% + 1px);
                    width: 100%;
                    left: 0px;
                    height: 1px;
                    background: rgb(60 60 60 / 18%);
                }
                .list-item[active] {
                    background: rgb(62 62 62 / 75%);
                }
                .list-item:active {
                    background: rgb(25 25 25 / 80%);
                }
            `;
        }
        
        render() {
            return html`
                <div class="title">List</div>
                <div class="list">
                    ${this.items.map(item => {
                        return html`
                            <div class="list-item" 
                                ?active="${item.name === current.name}"
                                @click="${e => this.setCurrent(item.name)}">${item.name}</div>
                        `;
                    })}
                </div>
            `;
        }
}
