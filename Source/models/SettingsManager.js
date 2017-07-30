import FileAccess from './FileAccess';

const path = window.require('path');

export default class SettingsManager {
    constructor() {
        this.settings = {
            automaticallyPaste: true,
            automaticallyGetVideo: false,
            automaticallyDownload: false
        }

        this.fileAccess = new FileAccess();
    }

    save(settings) {
        this.settings.automaticallyPaste = settings.automaticallyPaste;
        this.settings.automaticallyGetVideo = settings.automaticallyGetVideo;
        this.settings.automaticallyDownload = settings.automaticallyDownload;

        let pathToFile = path.join(this.fileAccess.getPath('userData'), "UserSettings.json");
        this.fileAccess.write(pathToFile, JSON.stringify(this.settings));
    }

    load(callback) {
        let pathToFile = path.join(this.fileAccess.getPath('userData'), "UserSettings.json");
        this.fileAccess.read(pathToFile, (error, data) => {
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