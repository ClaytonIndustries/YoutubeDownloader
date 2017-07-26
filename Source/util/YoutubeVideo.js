import VideoDownloader from './VideoDownloader';
import ProcessStarter from './ProcessStarter';
import { VS_PENDING, VS_DOWNLOADING, VS_CONVERTING, VS_CUTTING, VS_COMPLETE, VS_DOWNLOAD_FAILED, VS_CONVERSION_FAILED, VS_CUTTING_FAILED } from './VideoState'

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
        return this.status === VS_PENDING;
    }

    isActive() {
        return this.status === VS_DOWNLOADING || this.status === VS_CONVERTING || this.status === VS_CUTTING;
    }

    isComplete() {
        return this.status === VS_COMPLETE;
    }

    hasFailed() {
        return this.status === VS_DOWNLOAD_FAILED || this.status === VS_CONVERSION_FAILED || this.status === VS_CUTTING_FAILED;
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
                                this.setVideoStatus(VS_COMPLETE);
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
        this.setVideoStatus(VS_DOWNLOADING);

        let videoDownloader = new VideoDownloader();
        videoDownloader.get(this.videoQuality.downloadUrl, (action, value) => {
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
                            this.setVideoStatus(VS_DOWNLOAD_FAILED);
                            this.deleteFile(this.destinationVideoPath());
                        }
                        callback(error ? false : true);
                    });              
                    break;
                case "error":
                    this.setVideoStatus(VS_DOWNLOAD_FAILED);
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

        this.setVideoStatus(VS_CONVERTING);

        let pathToFFmpeg = path.resolve('dist/FFmpeg/bin/ffmpeg.exe');

        let args = [
            "-i", this.destinationVideoPath(), "-vn", "-ab", "128k", "-ac", "2", "-ar", "44100", this.destinationAudioPath(), "-y"
        ];

        this.processStarter.start(pathToFFmpeg, args, (success) => {
            if(!success) {
                this.setVideoStatus(VS_CONVERSION_FAILED);
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

        this.setVideoStatus(VS_CUTTING);

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
                this.setVideoStatus(VS_CUTTING_FAILED);
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
        this.setVideoStatus(VS_PENDING);
    }
}