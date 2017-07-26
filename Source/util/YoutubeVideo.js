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

    convertAudio() {
        return this.audioFormat.extension !== "";
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
                this.convertAudio((success) => {
                    if(success) {
                        this.cutVideo((success) => {
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
                        if(error) {
                            this.setVideoStatus("DownloadFailed");
                            this.deleteFile(this.destinationVideoPath());
                        }
                        callback(error ? false : true);
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
        if(this.convertAudio()) {
            return true;
        }

        this.setVideoStatus("Converting");

        let pathToFFmpeg = path.resolve('dist/FFmpeg/bin/ffmpeg.exe');

        let args = [
            "-i", this.destinationVideoPath(), "-vn", "-ab", "128k", "-ac", "2", "-ar", "44100", this.destinationAudioPath(), "-y"
        ];

        execFile(pathToFFmpeg, args , (error, stdout, stderr) => {
            console.log(error);
            if(error) {
                this.setVideoStatus("ConversionFailed");
                this.deleteFile(this.destinationAudioPath());
            }

            this.deleteFile(this.destinationVideoPath());

            callback(error ? false : true);
        });
    }

    cutVideo(callback) {
        if(this.startTime == 0 || this.newEndTime == this.originalEndTime) {
            return true;
        }

        this.setVideoStatus("Cutting");

        let pathToFFmpeg = path.resolve('dist/FFmpeg/bin/ffmpeg.exe');

        // calculate if we are cutting the original video or the extracted audio

        let args = [
            "-i", this.destinationVideoPath(), "-vn", "-ab", "128k", "-ac", "2", "-ar", "44100", this.destinationAudioPath(), "-y"
        ];

        execFile(pathToFFmpeg, args, (error, stdout, stderr) => {
            if(error) {
                this.setVideoStatus("CuttingFailed");
            }
            callback(error ? false : true);
        });
    }

    deleteFile(filepath) {
        if(electronFs.existsSync(filepath)) {
            electronFs.unlinkSync(filepath);
        }
    }
}