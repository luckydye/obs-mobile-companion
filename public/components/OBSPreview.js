import { css, html, LitElement } from 'https://cdn.pika.dev/lit-element';

async function createRTCAnswer(remoteOffer, callback) {
    return new Promise((resolve, reject) => {
        const rc = new RTCPeerConnection();
        let lastIce = null;
        rc.onicecandidate = e => {
            if(lastIce == rc.localDescription) {
                resolve(rc);
            }
            lastIce = rc.localDescription;
        }
        rc.ondatachannel = e => {
            rc.dc = e.channel;
            rc.dc.onmessage = e => {
                console.log('Remote msg:', e.data);
            }
            rc.dc.onopen = e => {
                console.log('Data Channel open');
            }
        }
        rc.onaddstream = e => {
            console.log('Stream', e.stream);
            callback(e.stream);
        }
        rc.setRemoteDescription(remoteOffer).then(e => {
            console.log('Offset accetped.');
        });
        rc.createAnswer().then(anser => {
            rc.setLocalDescription(anser).then(e => {
                console.log('Anser created.');
            })
        })
    })
}

function getMedia(callback) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext("2d");

    canvas.width = 1920;
    canvas.height = 1080;

    let fps = 0;
    let lastFrame = 0;

    const socket = io(location.host);

    socket.send('requestPreview');

    socket.on('message', async (type, data) => {
        switch(type) {
            case 'previewOffer':
                const description = data.description;
                const answer = await createRTCAnswer(description, stream => {
                    handleRemoteStream(stream);
                });
                const answerData = {
                    id: data.id,
                    description: answer.localDescription
                }
                socket.send('answer', answerData);
                break;
        }
    })

    function handleRemoteStream(stream) {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.muted = true;

        video.oncanplay = () => {
            video.play();
        }

        callback(stream, video);

        const draw = () => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(draw);
        }
        draw();
    }

    return canvas;
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
    }

    getStream() {
        return this.stream;
    }

    getVideo() {
        return this.video;
    }

    reformatCanvas() {
        this.canvas.width = this.clientWidth;
        this.canvas.height = this.clientHeight;
    }

    connectedCallback() {
        super.connectedCallback();
        this.reformatCanvas();

        this.video = getMedia((stream, video) => {
            this.stream = stream;
            this.videoSource = video;
            this.dispatchEvent(new Event('stream'));
        });
        
        this.ready = true;
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
                this.video.width, 
                this.video.height,
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
