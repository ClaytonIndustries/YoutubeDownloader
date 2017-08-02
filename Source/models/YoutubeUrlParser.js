import FilenameCleaner from './FilenameCleaner';
import SignatureDecryptor from './SignatureDecryptor';
import { URL_QUALITY, AUTH_CODE } from './Constants';

import Moment from 'moment';

export default class YoutubeUrlParser {
    constructor() {
        this.filenameCleaner = new FilenameCleaner();
        this.signatureDecryptor = new SignatureDecryptor();
        this.videoQualities = [];
    }

    parse(youtubeUrl, callback) {
        if(this.noVideoQualities()){
            this.downloadQualities((success) => {
                if(success) {
                    this.downloadWebpage(youtubeUrl, callback);
                }
                else {
                    callback();
                }
            });
        }
        else {
            this.downloadWebpage(youtubeUrl, callback);
        }
    }

    downloadWebpage(youtubeUrl, callback) {
        try {
            let httpRequest = new XMLHttpRequest();
            httpRequest.onload = () => {
                if(httpRequest.status == 200) {
                    try {
                        let webpage = httpRequest.responseText;
                        let webpageData = this.extractWebpageData(webpage, youtubeUrl);

                        if(!webpageData) {
                            callback();
                            return;
                        }

                        if(this.isSignatureEncrypted(webpageData.adaptiveFmtSection) && !this.signatureDecryptor.isDecrypted()) {
                            this.downloadPlayer(webpageData, callback);
                        }
                        else {
                            this.extractQualities(webpageData, callback);
                        }
                    }
                    catch(e) {
                        callback();       
                    }
                }
                else {
                    callback();
                }
            };
            httpRequest.onerror = () => callback();
            httpRequest.open("GET", youtubeUrl, true);
            httpRequest.send();
        }
        catch(e) {
            callback();
        }
    }

    downloadPlayer(webpageData, callback) {
        try {
            let httpRequest = new XMLHttpRequest();
            httpRequest.onload = () => {
                if(httpRequest.status == 200) {
                    try {
                        let player = httpRequest.responseText;
                        this.signatureDecryptor.getCryptoFunctions(player);
                        this.extractQualities(webpageData, callback);
                    }
                    catch(e) {
                        callback();
                    }
                }
                else {
                    callback();
                }
            };
            httpRequest.onerror = () => callback();
            httpRequest.open("GET", webpageData.playerUrl, true);
            httpRequest.send();
        }
        catch(e) {
            callback();
        }
    }

    downloadQualities(callback) {
        try {
            let httpRequest = new XMLHttpRequest();
            httpRequest.onload = () => {
                if(httpRequest.status == 200) {
                    try {
                        this.videoQualities = JSON.parse(httpRequest.responseText);
                        callback(true);
                    }
                    catch(e) {
                        callback(false);
                    }
                }
                else {
                    callback(false);
                }
            };
            httpRequest.onerror = () => callback(false);
            httpRequest.open("GET", URL_QUALITY, true);
            httpRequest.setRequestHeader("Authorization", AUTH_CODE);
            httpRequest.send();
        }
        catch(e) {
            callback();
        }
    }

    extractQualities(webpageData, callback) {
        let videoQualities = this.processSections(webpageData.fmtStreamMapSection, webpageData.adaptiveFmtSection);
        let videoLength = 0;
        let videoId = webpageData.videoId + Moment().format("x");

        for(let i = 0; i < videoQualities.length; i++) {
            if(videoLength <= 0) {
                videoLength = this.extractVideoDuration(videoQualities[i].downloadUrl);
            }
            else {
                break;
            }  
        }

        videoQualities.sort((a, b) => {
            if(a.type == 'Audio' && b.type == 'Video') {
                return -1;
            }
            else if(a.type == 'Video' && b.type == 'Audio') {
                return 1;
            }
            else if(a.type == b.type) {
                return (a.uiSortOrder > b.uiSortOrder) ? -1 : 1;
            }
            else {
                return 0;
            }
        });

        callback({ 
            title: webpageData.title,
            videoQualities: videoQualities,
            videoLength: videoLength,
            id: videoId
        });
    }

    extractVideoDuration(videoLink) {
        let matches = new RegExp("dur=([0-9]+)").exec(videoLink);

        let duration = 0;

        if(matches && matches.length >= 2) {
            duration = matches[1];
        }

        return duration;
    }

    processSections(fmtStreamMapSection, adaptiveFmtSection) {
        let qualities = [];

        try {
            if(this.isSignatureEncrypted(fmtStreamMapSection)) {
                qualities = this.processSectionWithEncryption(fmtStreamMapSection, qualities);
                qualities = this.processSectionWithEncryption(adaptiveFmtSection, qualities);
            }
            else {
                qualities = this.processSectionWithNoEncryption(fmtStreamMapSection, qualities);
                qualities = this.processSectionWithNoEncryption(adaptiveFmtSection, qualities);
            }
        }
        catch(e) {
        }

        return qualities;
    }

    processSectionWithEncryption(section, qualities) {
        section = section.replace(/codecs=\"[\s\S]*?\"/g, "");

        let regex = /(?=^|,[^+])[\s\S]*?(?:itag=)[\s\S]*?(?=,[^+]|$)/g;
        let matches = [];
        let currentMatch;

        while(currentMatch = regex.exec(section)) {
            matches.push(currentMatch[0]);
        }

        matches.forEach((match) => {
            try {
                let url = match;

                let signatureItems = new RegExp(/(?:^|,|\\u0026)s=([\s\S]+?)(?=\\|\\"|,|$)/).exec(url);

                let signature = this.signatureDecryptor.decrypt(signatureItems[1]);

                if(signature && signature.length > 0) {
                    let quality = this.createVideoQuality(url, qualities);

                    if(quality) {
                        url = url.substr(url.indexOf("url") + 4);

                        if(url.includes("\\")) {
                            url = url.substr(0, url.indexOf("\\"));
                        }

                        quality.downloadUrl = url + "&signature=" + signature;

                        qualities.push(quality);
                    }
                }
            }
            catch(e) {
            }
        });

        return qualities;
    }

    processSectionWithNoEncryption(section, qualities) {
        let matches = new RegExp("url=([\\s\\S]*?)\\\\", "g").exec(section);

        if(matches) {
            matches.forEach((match) => {
                try {
                    let videoLink = new RegExp("^[^,]*").exec(match[1])[0];

                    let quality = this.createVideoQuality(videoLink, qualities);

                    if(quality) {
                        qualities.push(quality);
                    }
                }
                catch(e) {
                }
            });
        }

        return qualities;
    }

    createVideoQuality(downloadUrl, qualities) {
        let itag = new RegExp("itag=(\\d+)").exec(downloadUrl)[1];

        let videoQuality = null;

        for(let i = 0; i < this.videoQualities.length; i++) {
            if(itag === this.videoQualities[i].itag) {
                videoQuality = this.videoQualities[i];
                break;
            }
        }

        if(videoQuality && !this.qualityAlreadyExists(qualities, videoQuality.description)) {
            return {
                downloadUrl: downloadUrl,
                extension: videoQuality.extension,
                type: videoQuality.type,
                description: videoQuality.description,
                uiSortOrder: videoQuality.uiSortOrder
            };
        }

        return undefined;
    }

    qualityAlreadyExists(qualities, description) {
        return qualities.some((quality) => {
            return quality.description === description;
        });
    }

    isSignatureEncrypted(fmtStreamMapSection) {
        return !new RegExp("signature=").test(fmtStreamMapSection);
    }

    extractWebpageData(webpage, youtubeUrl) {
        try {
            return {
                title: this.filenameCleaner.clean(this.extractTitle(webpage)),
                fmtStreamMapSection: this.extractAdaptiveFmtSection(webpage),
                adaptiveFmtSection: this.extractFmtStreamMapSection(webpage),
                playerUrl: this.extractPlayerUrl(webpage),
                videoId: new RegExp("v=(.*)").exec(youtubeUrl)[1]
            };
        }
        catch(e) {
            return undefined;
        }
    }

    extractTitle(webpage) {
        return new RegExp("<title>\s*(.+?)\s*(- YouTube|<\/title>)").exec(webpage)[1];
    }

    extractFmtStreamMapSection(webpage) {
        return decodeURIComponent(new RegExp("\"url_encoded_fmt_stream_map\":\"([\\s\\S]*?)\",").exec(webpage)[1]);
    }

    extractAdaptiveFmtSection(webpage) {
        return decodeURIComponent(new RegExp("\"adaptive_fmts\":\"([\\s\\S]*?)\",").exec(webpage)[1]);
    }

    extractPlayerUrl(webpage) {
        let playerUrl = new RegExp("\"js\":(.*?).js\"").exec(webpage)[0];
        playerUrl = playerUrl.replace(/"/g, "");
        playerUrl = playerUrl.replace(/\\/g, "");
        playerUrl = playerUrl.replace(" ", "");
        playerUrl = playerUrl.replace("js:", "https://www.youtube.com");
        return playerUrl;
    }

    noVideoQualities() {
        return !this.videoQualities || this.videoQualities.length === 0;
    }
}