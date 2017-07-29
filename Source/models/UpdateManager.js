import Update from './Update';

const remote = window.require('electron').remote;
const electronFs = remote.require('fs');
const admZip = window.require('adm-zip');

export default class UpdateManager {
    checkForUpdates(callback) {
        let httpRequest = new XMLHttpRequest();
        let url = "http://www.claytoninds.com/services/youtubedownloader/version/number";
        httpRequest.onload = () => {
            try {
                let content = JSON.parse(httpRequest.responseText);
                if(this.getFormattedVersionNumberFromString(content[0]) > this.getFormattedVersionNumberFromString("1.0")) {
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
        httpRequest.open("GET", url, true);
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
                        if(!error) {
                            let zip = new admZip(update.downloadLocation());
                            zip.extractAllTo(update.extractedLocation(), true);
                            callback(true);
                        }
                        else {
                            callback(false);
                        }
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
        httpRequest.setRequestHeader("Authorization", "AEE3024137A829E1");
        httpRequest.responseType = "arraybuffer";
        httpRequest.send();

        return httpRequest;
    }
}