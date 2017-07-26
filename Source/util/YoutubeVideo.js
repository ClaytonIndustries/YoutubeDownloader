import HttpClient from './HttpClient';
import ProcessStarter from './ProcessStarter';

const path = window.require('path');
const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

export default class YoutubeVideo {
    constructor() {
        this.size = 0;
        this.sizeInMBs = 0;
        this.progress = 0;
        this.changed;

        this.processStarter = new ProcessStarter();
    }

    destinationVideoPath() {
        return path.join(this.destinationFolder, this.title + this.videoQuality.extension);
    }

    destinationAudioPath() {
        return path.join(this.destinationFolder, this.title + this.audioFormat.extension);
    }

    shouldConvertAudio() {
        return this.audioFormat.extension !== "";
    }

    isPending() {
        return this.status === "Pending";
    }

    isActive() {
        return this.status === "Downloading" || this.status === "Converting" || this.status === "Cutting";
    }

    isComplete() {
        return this.status === "Complete";
    }

    hasFailed() {
        return this.status === "DownloadFailed" || this.status === "ConversionFailed" || this.status === "CuttingFailed";
    }

    setSize(size) {
        this.size = size;
        this.sizeInMBs = Number(size / 1000000).toFixed(2);
        if(this.changed) this.changed();
    }

    setProgress(bytesReceived) {
        this.progress = (bytesReceived / this.size) * 100;
        if(this.changed) this.changed();
    }

    setVideoStatus(newStatus) {
        this.status = newStatus;
        if(this.changed) this.changed();
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

    cancel() {
        // cancel all actions   
    }

    download(callback) {
        this.setVideoStatus("Downloading");

        let httpClient = new HttpClient();
        httpClient.get(this.videoQuality.downloadUrl, (action, value) => {
            switch(action) {
                case "size":
                    this.setSize(value);
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
        if(!this.shouldConvertAudio()) {
            callback(true);
            return;
        }

        this.setVideoStatus("Converting");

        let pathToFFmpeg = path.resolve('dist/FFmpeg/bin/ffmpeg.exe');

        let args = [
            "-i", this.destinationVideoPath(), "-vn", "-ab", "128k", "-ac", "2", "-ar", "44100", this.destinationAudioPath(), "-y"
        ];

        this.processStarter.start(pathToFFmpeg, args, (success) => {
            if(!success) {
                this.setVideoStatus("ConversionFailed");
                this.deleteFile(this.destinationAudioPath());
            }

            this.deleteFile(this.destinationVideoPath());

            callback(success);
        });
    }

    cutVideo(callback) {
        if(this.startTime == 0 && this.newEndTime == this.originalEndTime) {
            callback(true);
            return;
        }

        this.setVideoStatus("Cutting");

        let pathToFFmpeg = path.resolve('dist/FFmpeg/bin/ffmpeg.exe');

        let cuttingVideo = !this.shouldConvertAudio();
        let mediaPath = cuttingVideo ? this.destinationVideoPath() : this.destinationAudioPath();
        let renamedMediaPath = mediaPath.slice(0, mediaPath.lastIndexOf('\\') + 1) + "~" + mediaPath.slice(mediaPath.lastIndexOf('\\') + 1);

        electronFs.renameSync(mediaPath, renamedMediaPath);

        let args = [
            "-i", renamedMediaPath, "-ss", this.startTime, "-t", this.newEndTime, mediaPath
        ];

        this.processStarter.start(pathToFFmpeg, args, (success) => {
            if(!success) {
                this.setVideoStatus("CuttingFailed");
                this.deleteFile(mediaPath);
            }

            this.deleteFile(renamedMediaPath);

            callback(success);
        });
    }

    deleteFile(filepath) {
        if(electronFs.existsSync(filepath)) {
            electronFs.unlinkSync(filepath);
        }
    }

    resetStatus() {
        this.setProgress(0);
        this.setVideoStatus("Pending");
    }
}