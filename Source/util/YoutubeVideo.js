const path = window.require('path');
const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

import HttpClient from './HttpClient';

export default class YoutubeVideo {
    constructor() {
    }

    destinationVideoPath() {
        return path.join(this.destinationFolder, this.title + this.videoQuality.extension);
    }

    destinationAudioPath() {
        return path.join(this.destinationFolder, this.title + this.audioFormat.extension);
    }

    isPending() {
        return this.status === "pending";
    }

    convertToAudio() {
        return this.audioFormat.extension !== "";
    }

    setProgress(bytesReceived) {
        this.progress = (bytesReceived / this.size) * 100;
    }

    setVideoStatus(newStatus) {
        this.status = newStatus;
    }

    download() {
        this.setVideoStatus("downloading");

        let httpClient = new HttpClient();
        httpClient.get(this.videoQuality.downloadUrl, (action, value) => {
            if(action == "size") {
                this.size = value;
            }
            else if(action == "progress") {
                this.setProgress(value);
            }
            else if(action == "done") {
                electronFs.writeFile(this.destinationVideoPath(), value);
                this.setVideoStatus("complete");
            }
        });
    }
}