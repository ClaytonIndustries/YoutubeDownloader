import Moment from 'moment'; // Can we replace moment?

import {  
    FORMAT_AUDIO,
    FORMAT_VIDEO
} from './Constants';
import SignatureDecryptor from './SignatureDecryptor';

export default class YoutubeUrlParser {
    constructor() {
        this.signatureDecryptor = new SignatureDecryptor();
    }

    async parse(youtubeUrl) {
        const videoInfo = await this.downloadVideoInfo(youtubeUrl);

        if (!this.signatureDecryptor.isDecrypted()) {
            await this.downloadPlayer(youtubeUrl);
        }

        return this.extractQualities(videoInfo);
    }

    async downloadVideoInfo(youtubeUrl) {
        try {
            const headers = {
                'x-youtube-client-name': '1',
                'x-youtube-client-version': '2.20201028.00.00'
            };

            const response = await this.makeRequest(`${youtubeUrl}&pbj=1`, headers);
            const content = await response.json();

            return this.extractVideoInfo(content);
        } catch (e) {
            console.error(e);

            return Promise.reject(new Error('Download webpage failed'));
        }
    }

    async downloadPlayer(videoUrl) {
        try {
            const videoPageResponse = await this.makeRequest(videoUrl, {});
            const videoPageContent = await videoPageResponse.text();

            const playerVersion = new RegExp(/\/s\/player\/(.*?)\//).exec(videoPageContent)[1];
            const playerUrl = `https://www.youtube.com/s/player/${playerVersion}/player_ias.vflset/en_GB/base.js`;

            const playerResponse = await this.makeRequest(playerUrl, {});
            const playerContent = await playerResponse.text();

            if (this.signatureDecryptor.getCryptoFunctions(playerContent)) {
                return Promise.resolve();
            }

            return Promise.reject(new Error('Signature decryptor failed'));
        } catch (e) {
            console.error(e);

            return Promise.reject(new Error('Download player failed'));
        }
    }

    makeRequest(url, headers) {
        return fetch(url, {
            method: 'GET',
            headers
        });
    }

    extractQualities(videoInfo) {
        const qualities = this.processFormats(videoInfo.adaptiveFormats);
        const videoId = videoInfo.videoId + Moment().format('x');

        qualities.sort((a, b) => {
            if (a.type === FORMAT_AUDIO && b.type === FORMAT_VIDEO) {
                return -1;
            }
            if (a.type === FORMAT_VIDEO && b.type === FORMAT_AUDIO) {
                return 1;
            }
            if (a.type === b.type) {
                return (a.uiSortOrder >= b.uiSortOrder) ? -1 : 1;
            }

            return 0;
        });

        return {
            title: videoInfo.title,
            videoQualities: qualities,
            videoLength: videoInfo.duration,
            id: videoId
        };
    }

    processFormats(formats) {
        const qualities = [];

        if (!formats || formats.length === 0) {
            return qualities;
        }

        formats.forEach((format) => {
            try {
                if (!format.audioQuality) {
                    return;
                }

                // signatureCipher is probably always set now
                let url = decodeURIComponent(format.signatureCipher ? format.signatureCipher : format.url);

                const signatureItems = new RegExp(/(?:^|,|\\u0026|&)(?:s=|sig=)([\s\S]+?)(?=\\|\\"|,|&|$)/).exec(url);

                if (signatureItems) {
                    const signature = this.signatureDecryptor.decrypt(signatureItems[1]);

                    if (signature && signature.length > 0) {
                        if (url.includes('url')) { 
                            url = url.substr(url.indexOf('url') + 4);
                        }

                        if (url.includes('\\')) {
                            url = url.substr(0, url.indexOf('\\'));
                        }

                        const quality = this.createVideoQuality(`${url} &sig= ${signature}`, format);

                        qualities.push(quality);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });

        return qualities;
    }

    createVideoQuality(downloadUrl, format) {
        const extension = this.parseExtension(format.mimeType);
        const type = this.parseType(format.mimeType);

        return {
            downloadUrl,
            type,
            extension: `.${extension}`,
            description: this.generateDescription(extension, type, format),
            uiSortOrder: format.bitrate
        };
    }

    parseExtension(mimeType) {
        return new RegExp(/.*?\/([a-zA-Z0-9]+);/).exec(mimeType)[1];
    }

    parseType(mimeType) {
        const type = new RegExp(/(.*?)\//).exec(mimeType)[1];

        return this.capitaliseFirstLetter(type);
    }

    generateDescription(extension, type, format) {
        if (type === FORMAT_VIDEO) {
            return `${type}, ${format.qualityLabel} Quality, ${extension.toUpperCase()}`;
        } else {
            const quality = format.audioQuality.substring(format.audioQuality.lastIndexOf('_') + 1);

            return `${type}, ${this.capitaliseFirstLetter(quality)} Quality, ${extension.toUpperCase()}`;
        }
    }

    capitaliseFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    extractVideoInfo(videoInfoResponse) {
        const playerResponse = videoInfoResponse[2].playerResponse;

        return {
            title: playerResponse.videoDetails.title,
            adaptiveFormats: playerResponse.streamingData.adaptiveFormats,
            videoId: playerResponse.videoDetails.videoId,
            duration: playerResponse.videoDetails.lengthSeconds
        };
    }
}