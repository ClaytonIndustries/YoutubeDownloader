const path = window.require('path');
const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

import HttpClient from './HttpClient';

export default class YoutubeVideo {
    constructor() {
        this.size = 0;
        this.progress = 0;
    }

    destinationVideoPath() {
        return path.join(this.destinationFolder, this.title + this.videoQuality.extension);
    }

    destinationAudioPath() {
        return path.join(this.destinationFolder, this.title + this.audioFormat.extension);
    }

    isPending() {
        return this.status === "Pending";
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
        this.setVideoStatus("Downloading");

        let httpClient = new HttpClient();
        httpClient.get(this.videoQuality.downloadUrl, (action, value) => {
            switch(action) {
                case "size":
                    this.size = value;
                    break;
                case "progress":
                    this.setProgress(value);
                    break;
                case "complete":
                    electronFs.writeFile(this.destinationVideoPath(), value, (error) => {
                        if(!error) {
                            this.setVideoStatus("Complete");
                        }
                        else {
                            this.setVideoStatus("DownloadFailed");
                        }
                    });              
                    break;
                case "error":
                    this.setVideoStatus("DownloadFailed");
                    break;
            }
        });
    }
}