import { OS_WINDOWS, OS_MACOS } from './Constants';

const os = window.require('os');
const path = window.require('path');

export default class Update {
    platfromSpecificUrl() {
        return path.join(this.url, this.getPlatform());
    }

    downloadLocation() {
        return path.join(os.tmpdir(), "YoutubeDownloaderSetup.zip");
    }

    extractedLocation() {
        return path.join(os.tmpdir(), "YoutubeDownloaderSetup", this.getPlatform() === OS_WINDOWS ? ".msi" : ".exe");
    }

    getPlatform() {
        let platform =  os.platform();
        return platform === "darwin" ? OS_MACOS : OS_WINDOWS;
    }
}