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

            let response = await this.makeRequest(`${youtubeUrl}&pbj=1`, headers);

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
            let response = await this.makeRequest(playerUrl, {});

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

    makeRequest(url, headers) {
        return fetch(url, {
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

    processSections(standardFormats, adaptiveFormats) {
        let qualities = [];

        try {
            qualities = this.processSectionWithEncryption(standardFormats, qualities);
            qualities = this.processSectionWithEncryption(adaptiveFormats, qualities);
        }
        catch (e) {
            console.error(e);
        }

        return qualities;
    }

    processSectionWithEncryption(formats, qualities) {
        if (!formats || formats.length === 0) {
            return qualities;
        }

        formats.forEach(format => {
            try {
                let url = decodeURIComponent(format.cipher);

                let signatureItems = new RegExp(/(?:^|,|\\u0026|&)(?:s=|sig=)([\s\S]+?)(?=\\|\\"|,|&|$)/).exec(url);

                if(signatureItems)
                {
                    let signature = this.signatureDecryptor.decrypt(signatureItems[1]);

                    if(signature && signature.length > 0) {
                        let quality = this.createVideoQuality(url, format.itag, qualities);
    
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

    createVideoQuality(downloadUrl, itag, qualities) {
        let videoQuality = this.videoQualities.find(x => x.itag == itag);

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
        return qualities.some(quality => quality.description === description);
    }

    extractWebpageData(videoInfo) {
        const playerResponse = JSON.parse(videoInfo[2].player.args.player_response);

        return {
            title: videoInfo[3].playerResponse.videoDetails.title,
            standardFormats: playerResponse.streamingData.formats,
            adaptiveFormats: playerResponse.streamingData.adaptiveFormats,
            playerUrl: `https://youtube.com${videoInfo[2].player.assets.js}`,
            videoId: videoInfo[3].playerResponse.videoDetails.videoId,
            duration: videoInfo[3].playerResponse.videoDetails.lengthSeconds
        };
    }

    noVideoQualities() {
        return !this.videoQualities || this.videoQualities.length === 0;
    }
}