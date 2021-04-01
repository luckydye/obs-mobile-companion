import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';

async function getMedia(constraints = { 
    video: {
        width: 1920,
        height: 1080
    }
 }) {
    let stream = null;

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        /* use the stream */
    } catch (err) {
        /* handle the error */
    }

    return stream;
}

let ticksPerSeconds;

class OBSPreview extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
            }
        `;
    }

    constructor() {
        super();

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext("2d");

        this.sourceWidth = 1920;
        this.sourceHeight = 1080;

        window.addEventListener('resize', e => {
            this.reformatCanvas();
        });

        this.lastTick = 0;

        const loop = (currtick) => {
            const delta = currtick - this.lastTick;
            ticksPerSeconds = 1000 / delta;

            this.renderCanvas();
            requestAnimationFrame(loop);

            this.lastTick = currtick;
        }
        loop();

        getMedia().then(mediaStream => {
            const video = document.createElement('video');
            video.srcObject = mediaStream;
            video.onloadedmetadata = function(e) {
                video.play();
            };
            this.video = video;
        })
    }

    reformatCanvas() {
        this.canvas.width = this.clientWidth;
        this.canvas.height = this.clientHeight;
    }

    connectedCallback() {
        super.connectedCallback();
        this.reformatCanvas();
    }

    get preivewFps() {
        return Math.floor(ticksPerSeconds);
    }

    renderCanvas() {
        if (!this.canvas)
            return;

        const sw = this.sourceWidth;
        const sh = this.sourceHeight;

        const dw = this.canvas.width;
        const dh = this.canvas.height;

        const minW = Math.min(dw, sw);
        const minH = Math.min(dh, sh);

        this.context.clearRect(0, 0, dw, dh);

        const borderPadding = 80;

        const sar = sw / sh;

        let w = minW;
        let h = minW / sar;

        if (dh < h) {
            w = minH * sar;
            h = minH;
        }

        const borderPaddingX = 0;
        const borderPaddingY = 0;

        const cx = (dw / 2) - (w / 2);
        const cy = (dh / 2) - (h / 2);
        // this.context.fillStyle = "#00ff00";
        // this.context.strokeStyle = "#eee";
        // this.context.strokeRect(
        //     borderPaddingX + cx,
        //     borderPaddingY + cy,
        //     w - (borderPaddingX * 2),
        //     h - (borderPaddingY * 2)
        // );

        if(this.video) {
            this.context.drawImage(
                this.video, 
                0, 0,
                this.video.videoWidth, 
                this.video.videoHeight,
                borderPaddingX + cx,
                borderPaddingY + cy,
                w - (borderPaddingX * 2),
                h - (borderPaddingY * 2),
            )
        }

        // // overlay text
        // this.context.fillStyle = "#eee";
        // this.context.fillText(`${sw}x${sh}`, 20, dh - 20);

        // this.context.fillStyle = "#eee";
        // this.context.fillText(`${this.preivewFps}fps`, 120, dh - 20);
    }

    render() {
        return html`
                ${this.canvas}
            `;
    }

}

customElements.define('obs-preview', OBSPreview);
