
async function getVideoDevices() {
    const devices = {};
    return navigator.mediaDevices.enumerateDevices().then(d => {
        for(let device of d) {
            if(devices[device.kind] == undefined) {
                devices[device.kind] = [];
            }
            if (device.deviceId != "default" && 
                device.deviceId != "communications" ) {

                devices[device.kind].push(device);
            } else {
                devices[device.kind][device.deviceId] = device;
            }
        }
        return devices;
    });
}

async function getDeviceStream(deviceId) {
    console.log('Getting media:', deviceId);
    return navigator.mediaDevices.getUserMedia({
        video: {
            deviceId: deviceId,
            width: 1280, 
            height: 720
        },
        audio: {
            sampleSize: 24,
            sampleRate: 48000,
            noiseSuppression: false,
            autoGainControl: false,
            echoCancellation: false
        }
    }).catch(err => {
        console.error('Error getting device stream.');
        console.error(err);
    });
}

let lastOffer = null;

const audioBandwidth = 128;
const videoBandwidth = 1048;
function setBandwidth(sdp) {
    sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + audioBandwidth + '\r\n');
    sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + videoBandwidth + '\r\n');
    return sdp;
}

async function createRTCOffer(stream) {
    return new Promise((resolve, reject) => {
        const lc = new RTCPeerConnection();
        const dc = lc.createDataChannel("channel");

        if(lastOffer) {
            lastOffer.close();
        }
        lastOffer = lc;

        lc.addStream(stream);

        dc.onmessage = e => {
            console.log(e.data);
        }
        dc.onopen = e => {
            console.log('Connected to peer');
        }

        let lastIce = null;
        lc.onicecandidate = e => {
            // console.log('New Ice Candidate:', JSON.stringify(lc.localDescription));
            if(lc.localDescription == lastIce) {
                resolve(lc);
            }
            lc.localDescription.sdp = setBandwidth(lc.localDescription.sdp);
            lc.localDescription.sdp.replace("maxaveragebitrate=510000");
            lastIce = lc.localDescription;
        }

        lc.createOffer().then(offer => {
            lc.setLocalDescription(offer);
        })

        lc.acceptClient = answer => {
            lc.setRemoteDescription(answer);
        }
    })
}

let localStream = null;

const offers = {};

function connectToSocket(stream) {
    const socket = io("http://localhost:3000/");
    socket.send('boradcast', { test: true });

    socket.on('message', async (type, msg) => {
        switch(type) {
            case 'answer': 
                offers[msg.id].acceptClient(msg.description);
                console.log(msg);

                break;
            case 'createOffer': 
                const offer = await createRTCOffer(localStream);
                const data = {
                    id: msg.id,
                    description: offer.localDescription
                }
                offers[msg.id] = offer;
                socket.send('offer', data);
                break;
        }
    })
}

async function main() {
    const devices = await getVideoDevices();
    const videoDevice = devices.videoinput.find(dev => dev.label == "OBS Virtual Camera");
    const stream = await getDeviceStream(videoDevice.deviceId);
    localStream = stream;
    
    connectToSocket();

    // const video = document.createElement('video');
    // video.srcObject = stream;
    // video.play();
    // video.muted = true;

    // document.body.append(video);
}

main();
