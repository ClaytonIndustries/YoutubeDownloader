import Update from './Update';
import FileAccess from './FileAccess';
import { VERSION_NUMBER, URL_VERSION, AUTH_CODE, OS_WINDOWS, OS_MACOS } from './Constants';

const os = window.require('os');
const path = window.require('path');

export default class UpdateManager {
    constructor() {
        this.fileAccess = new FileAccess();
    }

    checkForUpdates() {
        return new Promise((resolve) => {
            let httpRequest = new XMLHttpRequest();
            httpRequest.onload = () => {
                try {
                    let response = JSON.parse(httpRequest.responseText);
                    if(this.getFormattedVersionNumberFromString(response.versionNumber) > this.getFormattedVersionNumberFromString(VERSION_NUMBER)) {
                        let update = new Update();
                        update.url = response.packageUrl;
                        update.binary = response.binary;
                        resolve(update);
                    }
                    else {
                        resolve();
                    }
                }
                catch(e) {
                    resolve();
                }
            }
            httpRequest.onerror = () => resolve();
            httpRequest.onabort = () => resolve();
            httpRequest.open("GET", path.join(URL_VERSION, this.getPlatform()), true);
            httpRequest.setRequestHeader("Authorization", AUTH_CODE);
            httpRequest.send();
        });    
    }

    getPlatform() {
        return os.platform() === "darwin" ? OS_MACOS : OS_WINDOWS;
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
                    this.fileAccess.write(update.downloadLocation(), byteArray, (error) => {
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
        httpRequest.open("GET", path.join(update.url, this.getPlatform()), true);
        httpRequest.setRequestHeader("Authorization", AUTH_CODE);
        httpRequest.responseType = "arraybuffer";
        httpRequest.send();

        return httpRequest;
    }

    unpackZipFile(update) {
        try {
            this.fileAccess.unpackZipFile(update.downloadLocation(), update.downloadFolder());
            return true;
        }
        catch(e) {
            return false;
        }
    }

    deleteFile(filepath) {
        if(this.fileAccess.exists(filepath)) {
            this.fileAccess.delete(filepath);
        }
    }
}