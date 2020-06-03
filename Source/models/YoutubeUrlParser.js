import SignatureDecryptor from './SignatureDecryptor';
import { videoQualities } from './videoQualities';

import Moment from 'moment';

export default class YoutubeUrlParser {
    constructor() {
        this.signatureDecryptor = new SignatureDecryptor();
        this.videoQualities = videoQualities;
    }

    async parse(youtubeUrl) {
        let videoInfo = await this.downloadVideoInfo(youtubeUrl);
                
        if(!this.signatureDecryptor.isDecrypted()) {
            await this.downloadPlayer(videoInfo.playerUrl);
        }

        return this.extractQualities(videoInfo);
    }

    async downloadVideoInfo(youtubeUrl) {
        try {
            const headers = {  
                "x-youtube-client-name": "1",
                "x-youtube-client-version": "2.20200123.00.01"
            };

            let response = await this.makeRequest(`${youtubeUrl}&pbj=1`, headers);

            let content = await response.json();

            return this.extractVideoInfo(content);
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

    extractQualities(videoInfo) {
        let videoQualities = this.processFormats(videoInfo.standardFormats, videoInfo.adaptiveFormats);
        let videoId = videoInfo.videoId + Moment().format("x");

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
            title: videoInfo.title,
            videoQualities: videoQualities,
            videoLength: videoInfo.duration,
            id: videoId
        };
    }

    processFormats(standardFormats, adaptiveFormats) {
        let qualities = [];

        qualities = this.processFormatsWithEncryption(standardFormats, qualities);
        qualities = this.processFormatsWithEncryption(adaptiveFormats, qualities);

        return qualities;
    }

    processFormatsWithEncryption(formats, qualities) {
        if (!formats || formats.length === 0) {
            return qualities;
        }

        formats.forEach(format => {
            try {
                let url = decodeURIComponent(format.signatureCipher ? format.signatureCipher : format.url);

                let signatureItems = new RegExp(/(?:^|,|\\u0026|&)(?:s=|sig=)([\s\S]+?)(?=\\|\\"|,|&|$)/).exec(url);

                if(signatureItems)
                {
                    let signature = this.signatureDecryptor.decrypt(signatureItems[1]);

                    if(signature && signature.length > 0) {
                        let quality = this.createVideoQuality(url, format.itag, qualities);
    
                        if(quality) {
                            if (url.includes("url")) {
                                url = url.substr(url.indexOf("url") + 4);
                            }

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
        let videoQuality = this.videoQualities.find(x => x.itag === itag);

        if(videoQuality && !this.qualityAlreadyExists(qualities, videoQuality.itag)) {
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

    qualityAlreadyExists(qualities, itag) {
        return qualities.some(quality => quality.itag === itag);
    }

    extractVideoInfo(videoInfoResponse) {
        const playerResponse = JSON.parse(videoInfoResponse[2].player.args.player_response);

        return {
            title: videoInfoResponse[3].playerResponse.videoDetails.title,
            standardFormats: playerResponse.streamingData.formats,
            adaptiveFormats: playerResponse.streamingData.adaptiveFormats,
            playerUrl: `https://youtube.com${videoInfoResponse[2].player.assets.js}`,
            videoId: videoInfoResponse[3].playerResponse.videoDetails.videoId,
            duration: videoInfoResponse[3].playerResponse.videoDetails.lengthSeconds
        };
    }

    noVideoQualities() {
        return !this.videoQualities || this.videoQualities.length === 0;
    }
}