const os = window.require('os');
const path = window.require('path');

export default class Update {
    downloadLocation() {
        return path.join(os.tmpdir(), "YoutubeDownloaderSetup.zip");
    }

    extractedLocation() {
        return path.join(os.tmpdir(), "YoutubeDownloaderSetup.exe");
    }
}