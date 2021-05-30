import { spawn } from 'child_process';

export default class VideoFeed {

    constructor() {

    }

    static async getVideoFeed() {
        const ffmpeg = spawn('ffmpeg', [
            '-f', 'dshow',
            '-i', 'video=OBS Virtual Camera',
            '-f', 'mjpeg',
            'pipe:1' // Output on stdout
        ]);

        ffmpeg.stderr.on('data', err => {
            console.error(err.toString());
        })

        return ffmpeg;
    }

}