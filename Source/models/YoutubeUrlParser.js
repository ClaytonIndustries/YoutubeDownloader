import Moment from 'moment';

import SignatureDecryptor from './SignatureDecryptor';
import videoQualities from './videoQualities';

export default class YoutubeUrlParser {
    constructor() {
        this.signatureDecryptor = new SignatureDecryptor();
        this.videoQualities = videoQualities;
    }

    async parse(youtubeUrl) {
        const videoInfo = await this.downloadVideoInfo(youtubeUrl);

        if (!this.signatureDecryptor.isDecrypted()) {
            await this.downloadPlayer(videoInfo.playerUrl);
        }

        return this.extractQualities(videoInfo);
    }

    async downloadVideoInfo(youtubeUrl) {
        try {
            const headers = {
                'x-youtube-client-name': '1',
                'x-youtube-client-version': '2.20200123.00.01'
            };

            const response = await this.makeRequest(`${youtubeUrl}&pbj=1`, headers);

            const content = await response.json();

            return this.extractVideoInfo(content);
        } catch (e) {
            console.error(e);

            return Promise.reject(new Error('Download webpage failed'));
        }
    }

    async downloadPlayer(playerUrl) {
        try {
            const response = await this.makeRequest(playerUrl, {});

            const content = await response.text();

            if (this.signatureDecryptor.getCryptoFunctions(content)) {
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
        const qualities = this.processFormats(videoInfo.standardFormats, videoInfo.adaptiveFormats);
        const videoId = videoInfo.videoId + Moment().format('x');

        qualities.sort((a, b) => {
            if (a.type === 'Audio' && b.type === 'Video') {
                return -1;
            }
            if (a.type === 'Video' && b.type === 'Audio') {
                return 1;
            }
            if (a.type === b.type) {
                return (a.uiSortOrder > b.uiSortOrder) ? -1 : 1;
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

        formats.forEach((format) => {
            try {
                let url = decodeURIComponent(format.signatureCipher ? format.signatureCipher : format.url);

                const signatureItems = new RegExp(/(?:^|,|\\u0026|&)(?:s=|sig=)([\s\S]+?)(?=\\|\\"|,|&|$)/).exec(url);

                if (signatureItems) {
                    const signature = this.signatureDecryptor.decrypt(signatureItems[1]);

                    if (signature && signature.length > 0) {
                        const quality = this.createVideoQuality(url, format.itag, qualities);

                        if (quality) {
                            if (url.includes('url')) {
                                url = url.substr(url.indexOf('url') + 4);
                            }

                            if (url.includes('\\')) {
                                url = url.substr(0, url.indexOf('\\'));
                            }

                            quality.downloadUrl = `${url} &sig= ${signature}`;

                            qualities.push(quality);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });

        return qualities;
    }

    createVideoQuality(downloadUrl, itag, qualities) {
        const videoQuality = this.videoQualities.find((x) => x.itag === itag);

        if (videoQuality && !this.qualityAlreadyExists(qualities, videoQuality.itag)) {
            return {
                downloadUrl,
                extension: videoQuality.extension,
                type: videoQuality.type,
                description: videoQuality.description,
                uiSortOrder: videoQuality.uiSortOrder
            };
        }

        return undefined;
    }

    qualityAlreadyExists(qualities, itag) {
        return qualities.some((quality) => quality.itag === itag);
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
}