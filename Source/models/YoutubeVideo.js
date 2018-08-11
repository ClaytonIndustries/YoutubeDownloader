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

    async start() {
        try {
            await this.download();

            await this.convertAudio();

            await this.cutVideo();

            this.setVideoStatus(VS_COMPLETE);
        }
        catch (e) {
        }
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

    download() {
        let self = this;

        return new Promise((resolve, reject) => {
            self.setVideoStatus(VS_DOWNLOADING);

            let videoDownloader = new VideoDownloader();
            let process = videoDownloader.get(self.videoQuality.downloadUrl, (action, value) => {
                switch (action) {
                    case "size":
                        self.setSize(value);
                        break;
                    case "progress":
                        self.setProgress(value);
                        break;
                    case "complete":
                        self.fileAccess.write(self.destinationVideoPath(), value, (error) => {
                            if (error) {
                                self.setVideoStatus(VS_DOWNLOAD_FAILED);
                                self.deleteFile(self.destinationVideoPath());
                                reject();
                            } else {
                                resolve();
                            }
                        });
                        break;
                    case "error":
                        self.setVideoStatus(VS_DOWNLOAD_FAILED);
                        reject();
                        break;
                }
            });
            self.setActiveProcess(process, PR_XHR);
        });
    }

    convertAudio() {
        let self = this;

        return new Promise((resolve, reject) => {
            if (!self.shouldConvertAudio()) {
                resolve();
                return;
            }

            self.setVideoStatus(VS_CONVERTING);

            let volume = self.volumePercentage / 100;

            let process = self.ffmpeg.extractVideoAudio(self.destinationVideoPath(), self.destinationAudioPath(), volume, (success) => {
                if (!success) {
                    self.setVideoStatus(VS_CONVERSION_FAILED);
                    self.deleteFile(self.destinationAudioPath());
                }

                self.deleteFile(self.destinationVideoPath());

                (success ? resolve : reject)();
            });

            self.setActiveProcess(process, PR_FFMPEG);
        });
    }

    cutVideo() {
        let self = this;

        return new Promise((resolve, reject) => {
            if (self.startTime == 0 && self.newEndTime == self.originalEndTime) {
                resolve();
                return;
            }

            self.setVideoStatus(VS_CUTTING);

            let cuttingVideo = !self.shouldConvertAudio();
            let mediaPath = cuttingVideo ? self.destinationVideoPath() : self.destinationAudioPath();
            let renamedMediaPath = mediaPath.slice(0, mediaPath.lastIndexOf('\\') + 1) + "~" + mediaPath.slice(mediaPath.lastIndexOf('\\') + 1);

            self.fileAccess.rename(mediaPath, renamedMediaPath);

            let process = self.ffmpeg.cutVideo(renamedMediaPath, mediaPath, self.startTime, self.newEndTime, (success) => {
                if (!success) {
                    self.setVideoStatus(VS_CUTTING_FAILED);
                    self.deleteFile(mediaPath);
                }

                self.deleteFile(renamedMediaPath);

                (success ? resolve : reject)();
            });

            self.setActiveProcess(process, PR_FFMPEG);
        });
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