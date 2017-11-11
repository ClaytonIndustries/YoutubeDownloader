const os = window.require('os');
const path = window.require('path');

export default class Update {
    constructor() {
        this.binary;
        this.url;
    }

    downloadFolder() {
        return os.tmpdir();
    }

    downloadLocation() {
        return path.join(this.downloadFolder(), "YoutubeDownloaderSetup.zip");
    }

    extractedLocation() {
        return path.join(this.downloadFolder(), this.binary);
    }
}