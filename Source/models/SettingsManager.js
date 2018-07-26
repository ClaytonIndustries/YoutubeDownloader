import FileAccess from './FileAccess';

const path = window.require('path');

export default class SettingsManager {
    constructor() {
        this.fileAccess = new FileAccess();
    }

    save(settings) {
        this.fileAccess.write(this.fileLocation(), JSON.stringify(settings));
    }

    load() {
        let self = this;

        return new Promise(function (resolve, reject) {
            self.fileAccess.read(self.fileLocation(), (error, data) => {
                if (!error) {
                    try {
                        let settingsData = JSON.parse(data);

                        self.raiseResponseCallback(resolve, settingsData.automaticallyPaste, settingsData.automaticallyGetVideo, settingsData.automaticallyDownload);
                    }
                    catch (e) {
                        self.raiseResponseCallback(resolve, true, false, false);
                    }
                }
                else {
                    self.raiseResponseCallback(resolve, true, false, false);
                }
            });
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