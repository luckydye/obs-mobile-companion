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
    const video = document.createElement('video');

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
        video.srcObject = stream;
        video.muted = true;

        video.oncanplay = () => {
            video.play();
        }

        callback(stream);
    }

    return video;
}

class OBSPreview extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
            }
            video {
                width: 100%;
                height: 100%;
                object-fit: contain;
                pointer-events: none;
            }
        `;
    }

    constructor() {
        super();
    }

    getStream() {
        return this.stream;
    }

    getVideo() {
        return this.video;
    }

    connectedCallback() {
        super.connectedCallback();

        this.video = getMedia((stream) => {
            this.stream = stream;
            this.dispatchEvent(new Event('stream'));
        });
        
        this.ready = true;
    }

    render() {
        return html`
            ${this.video}
        `;
    }

}

customElements.define('obs-preview', OBSPreview);
