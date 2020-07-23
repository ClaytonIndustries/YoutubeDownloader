import Moment from 'moment';

import getVideo from './VideoDownloader';
import {
    write,
    rename,
    remove,
    exists
} from './FileAccess';
import {
    extractVideoAudio,
    cutVideo
} from './FFmpeg';
import {
    VS_PENDING,
    VS_DOWNLOADING,
    VS_CONVERTING,
    VS_CUTTING,
    VS_COMPLETE,
    VS_DOWNLOAD_FAILED,
    VS_CONVERSION_FAILED,
    VS_CUTTING_FAILED,
    PR_XHR,
    PR_FFMPEG
} from './Constants';

const path = window.require('path');

export default class YoutubeVideo {
    constructor() {
        this.sizeInBytes = 0;
        this.sizeInMBs = 0;
        this.progress = 0;
        this.lastUpdateTime = Moment();
        this.changed = null;
        this.activeProcess = null;
    }

    destinationVideoPath() {
        return path.join(this.destinationFolder, this.title + this.videoQuality.extension);
    }

    destinationAudioPath() {
        return path.join(this.destinationFolder, this.title + this.audioFormat.extension);
    }

    shouldConvertAudio() {
        return this.audioFormat.extension !== '';
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

    setSize(sizeInBytes) {
        this.sizeInBytes = sizeInBytes;
        this.sizeInMBs = Number(this.sizeInBytes / 1000000).toFixed(2);
        this.raiseChanged();
    }

    setProgress(bytesReceived) {
        this.lastUpdateTime = Moment();
        this.progress = (bytesReceived / this.sizeInBytes) * 100;
        this.raiseChanged();
    }

    setVideoStatus(newStatus) {
        if (newStatus === VS_DOWNLOADING) {
            this.lastUpdateTime = Moment();
        }
        this.status = newStatus;
        this.raiseChanged();
    }

    setActiveProcess(process, type) {
        this.activeProcess = { process, type };
    }

    async start() {
        try {
            await this.download();

            await this.convertAudio();

            await this.cutVideo();

            this.setVideoStatus(VS_COMPLETE);
        } catch (e) {
            if (e) {
                console.error(e);
            }
        }
    }

    cancel() {
        if (this.activeProcess) {
            if ((this.activeProcess.type === PR_XHR && this.status === VS_DOWNLOADING)
                || (this.activeProcess.type === PR_FFMPEG && (this.status === VS_CONVERTING || this.status === VS_CUTTING))) {
                try {
                    this.activeProcess.process.abort();
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    async download() {
        const self = this;

        self.setVideoStatus(VS_DOWNLOADING);

        try {
            const controller = new AbortController();
            const { signal } = controller;

            self.setActiveProcess(controller, PR_XHR);

            const result = await getVideo(self.videoQuality.downloadUrl, signal, (action, value) => {
                switch (action) {
                    case 'size':
                        self.setSize(value);
                        break;
                    case 'progress':
                        self.setProgress(value);
                        break;
                }
            });

            await write(self.destinationVideoPath(), result);
        } catch (e) {
            self.setVideoStatus(VS_DOWNLOAD_FAILED);
            this.deleteFile(self.destinationVideoPath());
            throw e;
        }
    }

    async convertAudio() {
        const self = this;

        if (!self.shouldConvertAudio()) {
            return;
        }

        self.setVideoStatus(VS_CONVERTING);

        try {
            const volume = self.volumePercentage / 100;

            const controller = new AbortController();
            const { signal } = controller;

            self.setActiveProcess(controller, PR_FFMPEG);

            await extractVideoAudio(self.destinationVideoPath(), self.destinationAudioPath(), volume, signal);

            this.deleteFile(self.destinationVideoPath());
        } catch (e) {
            self.setVideoStatus(VS_CONVERSION_FAILED);
            this.deleteFile(self.destinationAudioPath());
            throw e;
        }
    }

    async cutVideo() {
        const self = this;

        if (self.startTime === 0 && self.newEndTime === self.originalEndTime) {
            return;
        }

        self.setVideoStatus(VS_CUTTING);

        const cuttingVideo = !self.shouldConvertAudio();
        const mediaPath = cuttingVideo ? self.destinationVideoPath() : self.destinationAudioPath();
        const renamedMediaPath = `${mediaPath.slice(0, mediaPath.lastIndexOf('\\') + 1)} ~  ${mediaPath.slice(mediaPath.lastIndexOf('\\') + 1)}`;

        try {
            rename(mediaPath, renamedMediaPath);

            const controller = new AbortController();
            const { signal } = controller;

            self.setActiveProcess(controller, PR_FFMPEG);

            await cutVideo(renamedMediaPath, mediaPath, self.startTime, self.newEndTime, signal);

            this.deleteFile(renamedMediaPath);
        } catch (e) {
            self.setVideoStatus(VS_CUTTING_FAILED);
            this.deleteFile(mediaPath);
            throw e;
        }
    }

    deleteFile(file) {
        if (exists(file)) {
            remove(file);
        }
    }

    resetStatus() {
        this.activeProcess = null;
        this.setProgress(0);
        this.setVideoStatus(VS_PENDING);
    }

    raiseChanged() {
        if (this.changed) this.changed();
    }
}