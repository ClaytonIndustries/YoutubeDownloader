import Update from './Update';
import { VERSION_NUMBER, URL_VERSION, AUTH_CODE } from '../models/Constants';

const remote = window.require('electron').remote;
const electronFs = remote.require('fs');
const admZip = window.require('adm-zip');

export default class UpdateManager {
    checkForUpdates(callback) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onload = () => {
            try {
                let content = JSON.parse(httpRequest.responseText);
                if(this.getFormattedVersionNumberFromString(content[0]) > this.getFormattedVersionNumberFromString(VERSION_NUMBER)) {
                    let update = new Update();
                    update.url = content[1];
                    callback(update);
                }
                else {
                    callback();
                }
            }
            catch(e) {
                callback();
            }
        }
        httpRequest.onerror = () => callback();
        httpRequest.onabort = () => callback();
        httpRequest.open("GET", URL_VERSION, true);
        httpRequest.setRequestHeader("Authorization", AUTH_CODE);
        httpRequest.send();
    }

    getFormattedVersionNumberFromString(versionNumber) {
        return Number(versionNumber.replace(".", ""));
    }

    downloadUpdate(update, callback) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onload = () => {
            if(httpRequest.status == 200) {
                try {
                    let byteArray = new Uint8Array(httpRequest.response);
                    electronFs.writeFile(update.downloadLocation(), byteArray, (error) => {
                        callback(!error && this.unpackZipFile(update));
                        this.deleteFile(update.downloadLocation());
                    });
                }
                catch(e) {
                    callback(false);
                }       
            }
            else {
                callback(false);
            }
        }
        httpRequest.onerror = () => callback(false);
        httpRequest.onabort = () => callback(false);
        httpRequest.open("GET", update.platfromSpecificUrl(), true);
        httpRequest.setRequestHeader("Authorization", AUTH_CODE);
        httpRequest.responseType = "arraybuffer";
        httpRequest.send();

        return httpRequest;
    }

    unpackZipFile(update) {
        try {
            let zip = new admZip(update.downloadLocation());
            zip.extractAllTo(update.downloadFolder(), true);
            return true;
        }
        catch(e) {
            return false;
        }
    }

    deleteFile(filepath) {
        if(electronFs.existsSync(filepath)) {
            electronFs.unlinkSync(filepath);
        }
    }
}