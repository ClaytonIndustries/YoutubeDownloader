
export default class SignatureDecryptor {
    constructor() {
        this.cryptoClassFunctionCalls;
        this.mappedCryptoFunctions;
    }

    getCryptoFunctions(playerUrl, callback) {
        if(this.isDecrypted()) {
            callback({
                cryptoClassFunctionCalls: this.downloadPlayercryptoClassFunctionCalls,
                mappedCryptoFunctions: this.mappedCryptoFunctions
            });
            return;
        }

        this.downloadPlayer(playerUrl, callback, this);
    }

    isDecrypted() {
        return this.mappedCryptoFunctions && this.mappedCryptoFunctions.length > 0;
    }

    downloadPlayer(playerUrl, callback, signatureDecryptor) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onload = () => {
            if(httpRequest.status == 200) {
                try {
                    let player = httpRequest.responseText;

                    signatureDecryptor.cryptoClassFunctionCalls = this.getCryptoClassFunctionCallsFromCryptoFunction(player);
                    signatureDecryptor.mappedCryptoFunctions = this.getCrytoClassFunctions(player, this.cryptoClassFunctionCalls[0]);

                    callback({
                        cryptoClassFunctionCalls: signatureDecryptor.cryptoClassFunctionCalls,
                        mappedCryptoFunctions: signatureDecryptor.mappedCryptoFunctions
                    });
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
        httpRequest.open("GET", playerUrl, true);
        httpRequest.send();
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
}