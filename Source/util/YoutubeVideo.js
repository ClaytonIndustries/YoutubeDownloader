import HttpClient from './HttpClient';

const path = window.require('path');
const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

const execFile = window.require('child_process').execFile;

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

    isActive() {
        return this.status === "Downloading" || this.status === "Converting" || this.status === "Cutting";
    }

    setProgress(bytesReceived) {
        this.progress = (bytesReceived / this.size) * 100;
    }

    setVideoStatus(newStatus) {
        this.status = newStatus;
    }

    start() {
        this.download((success) => {
            if(success) {
                convertAudio((success) => {
                    if(success) {
                        cutVideo((success) => {
                            if(success) {
                                this.setVideoStatus("Complete");
                            }
                        });
                    }
                });
            }
        });
    }

    download(callback) {
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
                            callback(true);
                        }
                        else {
                            this.setVideoStatus("DownloadFailed");
                            callback(false);
                        }
                    });              
                    break;
                case "error":
                    this.setVideoStatus("DownloadFailed");
                    callback(false);
                    break;
            }
        });
    }

    convertAudio(callback) {
        if(this.audioFormat.extension === "") {
            return true;
        }

        this.setVideoStatus("Converting");

        execFile("..\\dist\\FFmpeg\\bin\\ffmpeg.exe", ['-i "' + this.destinationVideoPath() + '" -vn -ab 128k -ac 2 -ar 44100 "' + this.destinationAudioPath() + '" -y'] , (error, stdout, stderr) => {
            if(error) {
                this.setVideoStatus("ConversionFailed");
            }          
            callback(error ? false : true);
        });
    }

    cutVideo(callback) {
        if(this.startTime == 0 || this.newEndTime == this.originalEndTime) {
            return true;
        }

        this.setVideoStatus("Cutting");

        execFile("..\\dist\\FFmpeg\\bin\\ffmpeg.exe", [""], (error, stdout, stderr) => {
            if(error) {
                this.setVideoStatus("CuttingFailed");
            }
            callback(error ? false : true);
        });
    }
}