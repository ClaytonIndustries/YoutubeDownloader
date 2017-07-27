const path = window.require('path');
const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

export default class SettingsManager {
    constructor() {
        this.settings = {
            automaticallyPaste: true,
            automaticallyGetVideo: false,
            automaticallyDownload: false
        }
    }

    save(settings) {
        this.settings.automaticallyPaste = settings.automaticallyPaste;
        this.settings.automaticallyGetVideo = settings.automaticallyGetVideo;
        this.settings.automaticallyDownload = settings.automaticallyDownload

        let pathToFile = path.join(remote.app.getPath('userData'), "UserSettings.json");
        electronFs.writeFile(pathToFile, JSON.stringify(this.settings), (error) => {
        });
    }

    load(callback) {
        let pathToFile = path.join(remote.app.getPath('userData'), "UserSettings.json");
        electronFs.readFile(pathToFile, "utf-8", (error, data) => {
            if(!error) {
                try {
                    let settingsData = JSON.parse(data);

                    this.settings.automaticallyPaste = settingsData.automaticallyPaste;
                    this.settings.automaticallyGetVideo = settingsData.automaticallyGetVideo;
                    this.settings.automaticallyDownload = settingsData.automaticallyDownload;
                }
                catch(e) {                    
                }

                callback(this.settings);
            }
        });
    }
}