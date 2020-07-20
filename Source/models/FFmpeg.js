import { startProcess } from './ProcessStarter';

const path = window.require('path');
const app = window.require('electron').remote.app;

export function extractVideoAudio(videoPath, audioPath, volumePercentage, signal) {
    let args = [
        "-i", videoPath, "-vn", "-ab", "128k", "-ac", "2", "-ar", "44100", "-filter:a", "volume=" + volumePercentage, audioPath, "-y"
    ];

    return startProcess(ffmpegLocation(), args, signal);
}

export function cutVideo(mediaPath, destinationMediaPath, startTime, endTime, signal) {
    let args = [
        "-i", mediaPath, "-ss", startTime, "-t", endTime, destinationMediaPath
    ];

    return startProcess(ffmpegLocation(), args, signal);
}

function ffmpegLocation() {
    return path.join(app.getAppPath(), 'dist/FFmpeg/bin/ffmpeg.exe');
}