import ProcessStarter from './ProcessStarter';

const path = window.require('path');

export default class FFmpeg {
    constructor() {
        this.pathToFFmpeg = path.join(path.dirname(window.require.main.filename), 'dist/FFmpeg/bin/ffmpeg.exe');
        this.processStarter = new ProcessStarter();
    }

    extractVideoAudio(videoPath, audioPath, callback) {
        let args = [
            "-i", videoPath, "-vn", "-ab", "128k", "-ac", "2", "-ar", "44100", audioPath, "-y"
        ];

        return this.processStarter.start(this.pathToFFmpeg, args, (success) => {
            callback(success);
        });
    }

    cutVideo(mediaPath, destinationMediaPath, startTime, endTime, callback) {
        let args = [
            "-i", mediaPath, "-ss", startTime, "-t", endTime, destinationMediaPath
        ];

        return this.processStarter.start(this.pathToFFmpeg, args, (success) => {
            callback(success);
        });
    }
}