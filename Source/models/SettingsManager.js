import FileAccess from './FileAccess';

const path = window.require('path');

export default class SettingsManager {
    constructor() {
        this.fileAccess = new FileAccess();
    }

    save(settings) {
        this.fileAccess.write(this.fileLocation(), JSON.stringify(settings));
    }

    load(callback) {
        this.fileAccess.read(this.fileLocation(), (error, data) => {
            if(!error) {
                try {
                    let settingsData = JSON.parse(data);

                    this.raiseResponseCallback(callback, settingsData.automaticallyPaste, settingsData.automaticallyGetVideo, settingsData.automaticallyDownload);
                }
                catch(e) {  
                    this.raiseResponseCallback(callback, true, false, false);                  
                }
            }
            else {
                this.raiseResponseCallback(callback, true, false, false);
            }
        });
    }

    raiseResponseCallback(callback, automaticallyPaste, automaticallyGetVideo, automaticallyDownload) {
        callback({
            automaticallyPaste: automaticallyPaste,
            automaticallyGetVideo: automaticallyGetVideo,
            automaticallyDownload: automaticallyDownload
        });
    }

    fileLocation() {
        return path.join(this.fileAccess.getPath('userData'), "UserSettings.json");
    }
}