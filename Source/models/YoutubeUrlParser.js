import FilenameCleaner from './FilenameCleaner';
import SignatureDecryptor from './SignatureDecryptor';
import { URL_QUALITY, URL_STATISTIC, AUTH_CODE } from './Constants';

import Moment from 'moment';

export default class YoutubeUrlParser {
    constructor() {
        this.filenameCleaner = new FilenameCleaner();
        this.signatureDecryptor = new SignatureDecryptor();
        this.videoQualities = [];
    }

    async parse(youtubeUrl) {
        this.logGetVideoCall();

        if (this.noVideoQualities()) {
            await this.downloadQualities();
        };

        let webpageData = await this.downloadWebpage(youtubeUrl);
                
        if(!this.signatureDecryptor.isDecrypted()) {
            await this.downloadPlayer(webpageData);
        }

        return this.extractQualities(webpageData);
    }

    async downloadQualities() {
        try {
            let response = await this.makeGetRequest(URL_QUALITY, true);

            this.videoQualities = JSON.parse(response);
        }
        catch (e) {
            console.error(e);

            return Promise.reject("Download video qualities failed");
        }
    }

    async downloadWebpage(youtubeUrl) {
        try {
            let response = await this.makeGetRequest(youtubeUrl, false);

            return this.extractWebpageData(response, youtubeUrl);
        }
        catch (e) {    
            console.error(e);

            return Promise.reject("Download webpage failed");
        }
    }

    async downloadPlayer(webpageData) {
        try {
            let response = await this.makeGetRequest(webpageData.playerUrl, false);

            if(this.signatureDecryptor.getCryptoFunctions(response)) {
                return Promise.resolve();
            }
            else {
                return Promise.reject("Signature decryptor failed");
            }
        }
        catch (e) {
            console.error(e);

            return Promise.reject("Download player failed");
        }
    }

    logGetVideoCall() {
        this.makePostRequest(URL_STATISTIC, true);
    }

    extractQualities(webpageData) {
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

        return { 
            title: webpageData.title,
            videoQualities: videoQualities,
            videoLength: videoLength,
            id: videoId
        };
    }

    extractVideoDuration(videoLink) {
        let matches = new RegExp("dur=([0-9]+)").exec(videoLink);

        let duration = 0;

        if(matches && matches.length >= 2) {
            duration = Number(matches[1]);
        }

        return duration == NaN ? 0 : duration;
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
        catch (e) {
            console.error(e);
        }

        return qualities;
    }

    processSectionWithEncryption(section, qualities) {
        if (!section) {
            return qualities;
        }

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

                let signatureItems = new RegExp(/(?:^|,|\\u0026|&)s=([\s\S]+?)(?=\\|\\"|,|$)/).exec(url);

                if(signatureItems)
                {
                    let signature = this.signatureDecryptor.decrypt(signatureItems[1]);

                    if(signature && signature.length > 0) {
                        let quality = this.createVideoQuality(url, qualities);
    
                        if(quality) {
                            url = url.substr(url.indexOf("url") + 4);
    
                            if(url.includes("\\")) {
                                url = url.substr(0, url.indexOf("\\"));
                            }
    
                            quality.downloadUrl = url + "&sig=" + signature;
    
                            qualities.push(quality);
                        }
                    }
                }                
            }
            catch (e) {
                console.error(e);
            }
        });

        return qualities;
    }

    processSectionWithNoEncryption(section, qualities) {
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

                let quality = this.createVideoQuality(url, qualities);

                if(quality) {
                    url = url.substr(url.indexOf("url") + 4);

                    if(url.includes("\\")) {
                        url = url.substr(0, url.indexOf("\\"));
                    }

                    quality.downloadUrl = url;

                    qualities.push(quality);
                }
            }
            catch (e) {
                console.error(e);
            }
        });

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
        return {
            title: this.filenameCleaner.clean(this.extractTitle(webpage)),
            fmtStreamMapSection: this.extractAdaptiveFmtSection(webpage),
            adaptiveFmtSection: this.extractFmtStreamMapSection(webpage),
            playerUrl: this.extractPlayerUrl(webpage),
            videoId: new RegExp("v=(.*)").exec(youtubeUrl)[1]
        };
    }

    extractTitle(webpage) {
        let result = new RegExp("<title>\s*(.+?)\s*(?:- YouTube|</title>)").exec(webpage);

        if (result && result[1] != "YouTube") {
            return result[1];
        }

        result = new RegExp("document.title = \"\s*(.+?)\s*(?:- YouTube|\";)").exec(webpage);

        if (result) {
            return result[1];
        }

        console.warn("No title found");

        return undefined;
    }

    extractFmtStreamMapSection(webpage) {
        let result = new RegExp("\"url_encoded_fmt_stream_map\":\"([\\s\\S]*?)\",").exec(webpage);

        if (result) {
            return decodeURIComponent(result[1]);
        }

        console.warn("No url_encoded_fmt_stream_map section found");

        return undefined;     
    }

    extractAdaptiveFmtSection(webpage) {
        let result = new RegExp("\"adaptive_fmts\":\"([\\s\\S]*?)\",").exec(webpage);

        if (result) {
            return decodeURIComponent(result[1]);
        }

        console.warn("No adaptive_fmts section found");

        return undefined;
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

    makeGetRequest(url, includeAuth) {
        return new Promise((resolve, reject) => {
            try {
                let httpRequest = new XMLHttpRequest();
                httpRequest.onload = () => {
                    if (httpRequest.status == 200) {
                        resolve(httpRequest.responseText);
                    }
                    else {
                        reject("Get request failed");
                    }
                };
                httpRequest.onerror = () => reject("Get request failed");
                httpRequest.open("GET", url, true);
                if(includeAuth) {
                    httpRequest.setRequestHeader("Authorization", AUTH_CODE);
                }
                httpRequest.send();
            }
            catch (e) {
                reject(e);
            }
        });
    }

    makePostRequest(url, includeAuth) {
        try {
            let httpRequest = new XMLHttpRequest();
            httpRequest.open("POST", url, true);
            if(includeAuth) {
                httpRequest.setRequestHeader("Authorization", AUTH_CODE);
            }
            httpRequest.send();
        }
        catch(e) {
        }
    }
}