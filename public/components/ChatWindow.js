import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';
import ToolbarContainer from './ToolbarContainer.js';

export default class ChatWindow extends ToolbarContainer {

    static get styles() {
        return css`
            ${super.styles}
            :host {
                width: auto;
            }
            iframe {
                width: 350px;
                height: 410px;
            }
        `;
    }

    constructor() {
        super();


    }

    render() {
        return html`
            <div class="container">
                <div class="title">Chat</div>
                
            </div>
        `;
    }
}

customElements.define('chat-window', ChatWindow);
