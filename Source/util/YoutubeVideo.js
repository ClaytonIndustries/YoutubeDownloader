const path = window.require('path');

export default class YoutubeVideo {
    constructor() {
    }

    destinationVideoPath() {
        return path.join(this.destinationFolder, this.title + this.videoQuality.extension);
    }

    destinationAudioPath() {
        return path.join(this.destinationFolder, this.title + this.audioFormat.extension);
    }

    convertToAudio() {
        return this.audioFormat.extension !== "";
    }

    setProgress(bytesReceived) {
        this.progress = (bytesReceived / this.size) * 100;
    }

    setStatus(newStatus) {
        this.status = newStatus;
    }
}