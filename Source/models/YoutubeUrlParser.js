import { URL_PARSE, AUTH_CODE } from './Constants';

export default class YoutubeUrlParser {
    parse(youtubeUrl, callback) {
        this.downloadWebpage(youtubeUrl, callback);
    }

    downloadWebpage(youtubeUrl, callback) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onload = () => {
            if(httpRequest.status == 200) {
                try {
                    let webpage = httpRequest.responseText;
                    let webpageData = this.extractWebpageData(webpage, youtubeUrl);

                    if(!webpageData) {
                        callback(false, null);
                        return;
                    }

                    if(this.isSignatureEncrypted(webpageData.adaptiveFmtSection)) {
                        this.downloadPlayer(webpageData, callback);
                    }
                    else {
                        this.downloadQualities(webpageData, null, callback);
                    }
                }
                catch(e) {
                    callback(false, null);       
                }
            }
            else {
                callback(false, null);
            }
        };
        httpRequest.onerror = () => callback();
        httpRequest.open("GET", youtubeUrl, true);
        httpRequest.send();
    }

    downloadPlayer(webpageData, callback) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onload = () => {
            if(httpRequest.status == 200) {
                try {
                    let player = httpRequest.responseText;

                    let cryptoClassFunctionCalls = this.getCryptoClassFunctionCallsFromCryptoFunction(player);
                    let mappedCryptoFunctions = this.getCrytoClassFunctions(player, cryptoClassFunctionCalls[0]);

                    let crypto = {
                        cryptoClassFunctionCalls: cryptoClassFunctionCalls,
                        mappedCryptoFunctions: mappedCryptoFunctions
                    };

                    this.downloadQualities(webpageData, crypto, callback);
                }
                catch(e) {
                    callback(false, null);
                }
            }
            else {
                callback(false, null);
            }
        };
        httpRequest.onerror = () => callback();
        httpRequest.open("GET", webpageData.playerUrl, true);
        httpRequest.send();
    }

    downloadQualities(webpageData, crypto, callback) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onload = () => {
            if(httpRequest.status == 200) {
                try {
                    let response = JSON.parse(httpRequest.responseText);
                    callback(true, response);
                }
                catch(e) {
                    callback(false, null);
                }
            }
            else {
                callback(false, null);
            }
        };
        httpRequest.onerror = () => callback();
        httpRequest.open("POST", URL_PARSE, true);
        httpRequest.setRequestHeader("Authorization", AUTH_CODE);
        httpRequest.setRequestHeader("Content-type", "application/json");
        httpRequest.send(JSON.stringify({
            title: webpageData.title,
            fmtStreamMapSection: webpageData.fmtStreamMapSection,
            adaptiveFmtSection: webpageData.adaptiveFmtSection,
            videoId: webpageData.videoId,
            crypto: crypto
        }));
    }

    isSignatureEncrypted(fmtStreamMapSection) {
        return !new RegExp("signature=").test(fmtStreamMapSection);
    }

    getCryptoClassFunctionCallsFromCryptoFunction(webpage) {       
        let functionBody = new RegExp("{([a-z]=[a-z]\\.split\\(\"\"\\).*?;return [a-z]\\.join\\(\"\"\\))}").exec(webpage)[1];

		let cryptoFunctionNames = functionBody.split(";");

		for(let i = 0; i < cryptoFunctionNames.length; i++) {
			cryptoFunctionNames[i] = cryptoFunctionNames[i].replace("\n", "");
		}

		cryptoFunctionNames.shift();
		cryptoFunctionNames.pop();

		return cryptoFunctionNames;
	}

	getCrytoClassFunctions(webpage, anyCryptoClassFunctionCall) {
        let cryptoClassName = new RegExp(".+\\.").exec(anyCryptoClassFunctionCall)[0];

		cryptoClassName = cryptoClassName.replace('.', '');

		let cryptoClass = new RegExp("var " + cryptoClassName + "={([\\s\\S]*?)};").exec(webpage)[1];

		let cryptoClassFunctions = cryptoClass.split("},");

		for(let i = 0; i < cryptoClassFunctions.length; i++) {
			cryptoClassFunctions[i] = cryptoClassFunctions[i].replace("\n", "");
		}

		return this.mapCryptoClassFunctionsToOperations(cryptoClassFunctions);
	}

	mapCryptoClassFunctionsToOperations(cryptoClassFunctions) {
        let functions = [];
        
        for(let i = 0; i < cryptoClassFunctions.length; i++) {
            if(cryptoClassFunctions[i].includes('splice')) {
				functions.push({func: cryptoClassFunctions[i].substr(0, 2), action: 'splice'});
			}
			else if(cryptoClassFunctions[i].includes('reverse')) {
				functions.push({func: cryptoClassFunctions[i].substr(0, 2), action: 'reverse'});
			}
			else {
				functions.push({func: cryptoClassFunctions[i].substr(0, 2), action: 'swap'});
			}
		}

		return functions;
    }
    
    extractWebpageData(webpage, youtubeUrl) {
        try {
            return {
                title: this.extractTitle(webpage),
                fmtStreamMapSection: this.extractAdaptiveFmtSection(webpage),
                adaptiveFmtSection: this.extractFmtStreamMapSection(webpage),
                playerUrl: this.extractplayerUrl(webpage),
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

    extractplayerUrl(webpage) {
        let playerUrl = new RegExp("\"js\":(.*?).js\"").exec(webpage)[0];
        playerUrl = playerUrl.replace(/"/g, "");
        playerUrl = playerUrl.replace(/\\/g, "");
        playerUrl = playerUrl.replace(" ", "");
        playerUrl = playerUrl.replace("js:", "https://www.youtube.com");
        return playerUrl;
    }
}