import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';

export default class ToolbarContainer extends LitElement {

        static get styles() {
            return css`
                :host {
                    min-height: 300px;
                    height: 90%;
                    color: rgb(238, 238, 238);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    display: grid;
                    grid-template-rows: auto 1fr auto;
                    padding: 4px;
                    border-radius: 10px;
                    background: rgba(42, 42, 42, 0.75);
                    backdrop-filter: blur(8px);
                    font-family: Lato, sans-serif;
                    box-shadow: rgb(0 0 0 / 25%) 1px 2px 18px;
                    max-height: 100%;
                    width: 100%;
                    box-sizing: border-box;
                }
                .title {
                    width: calc(100% + 8px);
                    height: 28px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-bottom: 1px solid #151515;
                    font-size: 12px;
                    font-weight: 400;
                    background: #2a2a2a;
                    margin: -4px -4px 4px -4px;
                    opacity: 0.5;
                    border-top-left-radius: 10px;
                    border-top-right-radius: 10px;
                }
            `;
        }
        
        render() {
            return html`
                <div class="container">
                    <div class="title">Title</div>
                    Container
                </div>
            `;
        }
}
