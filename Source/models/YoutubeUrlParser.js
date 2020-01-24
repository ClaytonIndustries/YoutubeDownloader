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

    async parse(youtubeUrl) {
        if (this.noVideoQualities()) {
            await this.downloadQualities();
        };

        let videoInfo = await this.downloadVideoInfo(youtubeUrl);
                
        if(!this.signatureDecryptor.isDecrypted()) {
            await this.downloadPlayer(videoInfo.playerUrl);
        }

        return this.extractQualities(videoInfo);
    }

    async downloadQualities() {
        try {
            const headers = {  
                "Authorization": AUTH_CODE
            };

            let response = await this.makeRequest(URL_QUALITY, headers);

            this.videoQualities = await response.json();
        }
        catch (e) {
            console.error(e);

            return Promise.reject("Download video qualities failed");
        }
    }

    async downloadVideoInfo(youtubeUrl) {
        try {
            const headers = {  
                "x-youtube-client-name": "1",
                "x-youtube-client-version": "2.20200123.00.01"
            };

            let response = await this.makeRequest(youtubeUrl, headers);

            let content = await response.json();

            return this.extractWebpageData(content);
        }
        catch (e) {    
            console.error(e);

            return Promise.reject("Download webpage failed");
        }
    }

    async downloadPlayer(playerUrl) {
        try {
            let response = await this.makeRequest(playerUrl, null);

            let content = await response.text();

            if(this.signatureDecryptor.getCryptoFunctions(content)) {
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

    async makeRequest(url, headers) {
        return await fetch(url, {
            method: "GET",
            headers: headers
        });
    }

    extractQualities(webpageData) {
        let videoQualities = this.processSections(webpageData.standardFormats, webpageData.adaptiveFormats);
        let videoId = webpageData.videoId + Moment().format("x");

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
            videoLength: webpageData.duration,
            id: videoId
        };
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

                let signatureItems = new RegExp(/(?:^|,|\\u0026|&)(?:s=|sig=)([\s\S]+?)(?=\\|\\"|,|&|$)/).exec(url);

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

    // Do we assume that all sigs are encrypted now?
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

    // Pass the itag in here
    createVideoQuality(downloadUrl, qualities) {
        let itag = new RegExp("itag=(\\d+)").exec(downloadUrl)[1];

        // This can be simplified
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

    extractWebpageData(videoInfo) {
        return {
            title: videoInfo[3].playerResponse.videoDetails.title,
            standardFormats: videoInfo[2].player.args.player_response.streamingData.formats,
            adaptiveFormats: videoInfo[2].player.args.player_response.streamingData.adaptiveFormats,
            playerUrl: `https://youtube.com${videoInfo[2].player.assets.js}`,
            videoId: videoInfo[3].playerResponse.videoDetails.videoId,
            duration: videoInfo[3].playerResponse.videoDetails.lengthSeconds
        };
    }

    noVideoQualities() {
        return !this.videoQualities || this.videoQualities.length === 0;
    }
}