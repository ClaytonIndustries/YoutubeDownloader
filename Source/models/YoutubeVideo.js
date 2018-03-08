import Moment from 'moment';

import VideoDownloader from './VideoDownloader';
import ProcessStarter from './ProcessStarter';
import FileAccess from './FileAccess';
import FFmpeg from './FFmpeg';
import { VS_PENDING, VS_DOWNLOADING, VS_CONVERTING, VS_CUTTING, VS_COMPLETE, VS_DOWNLOAD_FAILED, VS_CONVERSION_FAILED, VS_CUTTING_FAILED, PR_XHR, PR_FFMPEG } from './Constants';

const path = window.require('path');

export default class YoutubeVideo {
    constructor() {
        this.size = 0;
        this.sizeInMBs = 0;
        this.progress = 0;
        this.lastUpdateTime = Moment();
        this.changed;
        this.activeProcess;

        this.fileAccess = new FileAccess();
        this.ffmpeg = new FFmpeg();
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
        return this.status === VS_DOWNLOADING && (Moment().unix() - this.lastUpdateTime.unix()) >= 10;
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
        if(newStatus === VS_DOWNLOADING) {
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
            if(this.activeProcess.type === PR_XHR && this.status === VS_DOWNLOADING) {
                try {
                    this.activeProcess.process.abort();
                }
                catch(e) {       
                }
            }
            else if(this.activeProcess.type === PR_FFMPEG && (this.status === VS_CONVERTING || this.status === VS_CUTTING)) {
                try {
                    this.activeProcess.process.kill();
                }
                catch(e) {                
                }
            }
        }
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
                    this.fileAccess.write(this.destinationVideoPath(), value, (error) => {
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
        this.setActiveProcess(process, PR_XHR);
    }

    convertAudio(callback) {
        if(!this.shouldConvertAudio()) {
            callback(true);
            return;
        }

        this.setVideoStatus(VS_CONVERTING);

        let volume = this.volumePercentage / 100;

        let process = this.ffmpeg.extractVideoAudio(this.destinationVideoPath(), this.destinationAudioPath(), volume, (success) => {
            if(!success) {
                this.setVideoStatus(VS_CONVERSION_FAILED);
                this.deleteFile(this.destinationAudioPath());
            }

            this.deleteFile(this.destinationVideoPath());

            callback(success);
        });
        
        this.setActiveProcess(process, PR_FFMPEG);
    }

    cutVideo(callback) {
        if(this.startTime == 0 && this.newEndTime == this.originalEndTime) {
            callback(true);
            return;
        }

        this.setVideoStatus(VS_CUTTING);

        let cuttingVideo = !this.shouldConvertAudio();
        let mediaPath = cuttingVideo ? this.destinationVideoPath() : this.destinationAudioPath();
        let renamedMediaPath = mediaPath.slice(0, mediaPath.lastIndexOf('\\') + 1) + "~" + mediaPath.slice(mediaPath.lastIndexOf('\\') + 1);

        this.fileAccess.rename(mediaPath, renamedMediaPath);

        let process = this.ffmpeg.cutVideo(renamedMediaPath, mediaPath, this.startTime, this.newEndTime, (success) => {
            if(!success) {
                this.setVideoStatus(VS_CUTTING_FAILED);
                this.deleteFile(mediaPath);
            }

            this.deleteFile(renamedMediaPath);

            callback(success);
        });

        this.setActiveProcess(process, PR_FFMPEG);
    }

    deleteFile(filepath) {
        if(this.fileAccess.exists(filepath)) {
            this.fileAccess.delete(filepath);
        }
    }

    resetStatus() {
        this.activeProcess = null;
        this.setProgress(0);
        this.setVideoStatus(VS_PENDING);
    }
}