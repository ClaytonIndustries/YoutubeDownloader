import Moment from 'moment';

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
        this.lastUpdateTime = Moment();
        this.changed;
        this.activeProcess;

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

    noContentDownloadedInLastTenSeconds() {
        return this.status === VS_DOWNLOADING && Moment().isBetween(this.lastUpdateTime, Moment().add(10, 'seconds'));
    }

    setSize(size) {
        this.size = size;
        this.sizeInMBs = Number(size / 1000000).toFixed(2);
        if(this.changed) this.changed();
    }

    setProgress(bytesReceived) {
        this.lastUpdateTime = Moment();
        this.progress = (bytesReceived / this.size) * 100;
        if(this.changed) this.changed();
    }

    setVideoStatus(newStatus) {
        if(this.status === VS_DOWNLOADING) {
            this.lastUpdateTime = Moment();
        }
        this.status = newStatus;
        if(this.changed) this.changed();
    }

    setActiveProcess(process, type) {
        this.activeProcess = {process: process, type: type};
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
        if(this.activeProcess) {
            if(this.activeProcess.type === "xhr" && this.status === VS_DOWNLOADING) {
                try {
                    this.activeProcess.process.abort();
                }
                catch(e) {       
                }
            }
            else if(this.activeProcess.type === "process" && this.status === VS_CONVERTING || this.status === VS_CUTTING) {
                try {
                    this.activeProcess.process.kill();
                }
                catch(e) {                
                }
            }
        }

        this.deleteFile(this.destinationVideoPath());
        this.deleteFile(this.destinationAudioPath());
    }

    download(callback) {
        this.setVideoStatus(VS_DOWNLOADING);

        let videoDownloader = new VideoDownloader();
        let process = videoDownloader.get(this.videoQuality.downloadUrl, (action, value) => {
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
        this.setActiveProcess(process, "xhr");
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

        let process = this.processStarter.start(pathToFFmpeg, args, (success) => {
            if(!success) {
                this.setVideoStatus(VS_CONVERSION_FAILED);
                this.deleteFile(this.destinationAudioPath());
            }

            this.deleteFile(this.destinationVideoPath());

            callback(success);
        });
        this.setActiveProcess(process, "process");
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

        let process = this.processStarter.start(pathToFFmpeg, args, (success) => {
            if(!success) {
                this.setVideoStatus(VS_CUTTING_FAILED);
                this.deleteFile(mediaPath);
            }

            this.deleteFile(renamedMediaPath);

            callback(success);
        });
        this.setActiveProcess(process, "process");
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