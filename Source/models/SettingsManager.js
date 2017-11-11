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

        this.fileAccess.write(this.fileLocation(), JSON.stringify(this.settings));
    }

    load(callback) {
        this.fileAccess.read(this.fileLocation(), (error, data) => {
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

    fileLocation() {
        return path.join(this.fileAccess.getPath('userData'), "UserSettings.json");
    }
}