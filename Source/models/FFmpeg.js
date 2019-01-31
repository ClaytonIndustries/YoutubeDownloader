import ProcessStarter from './ProcessStarter';

const path = window.require('path');

export default class FFmpeg {
    constructor() {
        this.processStarter = new ProcessStarter();
    }

    extractVideoAudio(videoPath, audioPath, volumePercentage, callback) {
        let args = [
            "-i", videoPath, "-vn", "-ab", "128k", "-ac", "2", "-ar", "44100", "-filter:a", "volume=" + volumePercentage, audioPath, "-y"
        ];

        return this.processStarter.start(this.ffmpegLocation(), args, (success) => {
            callback(success);
        });
    }

    cutVideo(mediaPath, destinationMediaPath, startTime, endTime, callback) {
        let args = [
            "-i", mediaPath, "-ss", startTime, "-t", endTime, destinationMediaPath
        ];

        return this.processStarter.start(this.ffmpegLocation(), args, (success) => {
            callback(success);
        });
    }

    ffmpegLocation() {
        return path.join(path.dirname(window.require.main.filename), 'FFmpeg/bin/ffmpeg.exe');
    }
}