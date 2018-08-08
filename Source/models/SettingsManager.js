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

                        if (!settingsData.saveToPath) {
                            settings.saveToPath = this.fileAccess.getPath("downloads");
                        }

                        self.raiseResponseCallback(resolve, settingsData.automaticallyPaste, settingsData.automaticallyGetVideo,
                            settingsData.automaticallyDownload, settingsData.saveToPath);
                    }
                    catch (e) {
                        self.returnDefaultSettings(resolve);
                    }
                }
                else {
                    self.returnDefaultSettings(resolve);
                }
            });
        });
    }

    raiseResponseCallback(callback, automaticallyPaste, automaticallyGetVideo, automaticallyDownload, saveToPath) {
        callback({
            automaticallyPaste: automaticallyPaste,
            automaticallyGetVideo: automaticallyGetVideo,
            automaticallyDownload: automaticallyDownload,
            saveToPath: saveToPath
        });
    }

    returnDefaultSettings(resolve) {
        this.raiseResponseCallback(resolve, true, false, false, this.fileAccess.getPath("downloads"));
    }

    fileLocation() {
        return path.join(this.fileAccess.getPath('userData'), "UserSettings.json");
    }
}