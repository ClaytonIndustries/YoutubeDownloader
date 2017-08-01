import { URL_PARSE, AUTH_CODE } from './Constants';

export default class YoutubeUrlParser {
    parse(youtubeUrl, callback) {
        try {
            this.downloadWebpage(youtubeUrl, (result) => {
                if(result) {
                    let title = this.extractTitle(result);
                    let fmtStreamMapSection = decodeURIComponent(this.extractAdaptiveFmtSection(result));
                    let adaptiveFmtSection = decodeURIComponent(this.extractFmtStreamMapSection(result));
                    let playerUrl = this.extractplayerUrl(result);
                    let videoId = new RegExp("v=(.*)").exec(youtubeUrl)[1];

                    this.extractUrls(title, fmtStreamMapSection, adaptiveFmtSection, playerUrl, videoId, (urls) => {
                        if(urls) {
                            callback(true, urls);
                        }
                        else {
                            callback(false, null);
                        }
                    });
                }
                else {
                    callback(false, null);
                }
            });
        }
        catch(e) {
            callback(false, null);
        }
    }

    downloadWebpage(youtubeUrl, callback) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onload = () => {
            if(httpRequest.status == 200) {
                callback(httpRequest.responseText);
            }
            else {
                callback();
            }
        };
        httpRequest.onerror = () => callback();
        httpRequest.open("GET", youtubeUrl, true);
        httpRequest.send();
    }

    extractUrls(title, fmtStreamMapSection, adaptiveFmtSection, playerUrl, videoId, callback) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onload = () => {
            if(httpRequest.status == 200) {
                let response = JSON.parse(httpRequest.responseText);
                callback(response);
            }
            else {
                callback();
            }
        };
        httpRequest.onerror = () => callback();
        httpRequest.open("POST", URL_PARSE, true);
        httpRequest.setRequestHeader("Authorization", AUTH_CODE);
        httpRequest.setRequestHeader("Content-type", "application/json");
        httpRequest.send(JSON.stringify({
            title: title,
            fmtStreamMapSection: fmtStreamMapSection,
            adaptiveFmtSection: adaptiveFmtSection,
            playerUrl: playerUrl,
            videoId: videoId
        }));
    }

    extractTitle(webpage) {
        return new RegExp("<title>\s*(.+?)\s*(- YouTube|<\/title>)").exec(webpage)[1];
    }

    extractFmtStreamMapSection(webpage) {
        return new RegExp("\"url_encoded_fmt_stream_map\":\"([\\s\\S]*?)\",").exec(webpage)[1];
    }

    extractAdaptiveFmtSection(webpage) {
        return new RegExp("\"adaptive_fmts\":\"([\\s\\S]*?)\",").exec(webpage)[1];
    }

    extractplayerUrl(webpage) {
        let playerUrl = new RegExp("\"js\":(.*?).js\"").exec(webpage)[0];
        playerUrl = playerUrl.replace("/", "");
        playerUrl = playerUrl.replace("\\", "");
        playerUrl = playerUrl.replace(" ", "");
        playerUrl = playerUrl.replace("js:", "https://www.youtube.com");
        return playerUrl;
    }
}