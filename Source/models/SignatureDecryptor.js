
export default class SignatureDecryptor {
    constructor() {
        this.cryptoClassFunctionCalls;
        this.mappedCryptoFunctions;
    }

    getCryptoFunctions(player) {
        this.cryptoClassFunctionCalls = this.getCryptoClassFunctionCallsFromCryptoFunction(player);
        this.mappedCryptoFunctions = this.getCrytoClassFunctions(player, this.cryptoClassFunctionCalls[0]);

        return this.isDecrypted();
    }

    isDecrypted() {
        return this.mappedCryptoFunctions && this.mappedCryptoFunctions.length > 0;
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

    decrypt(signature) {
		if(!signature || signature.length == 0) {
			return '';
		}

        let decryptedSignature = signature;
        
        this.cryptoClassFunctionCalls.forEach((cryptoClassFunctionCall) => {
            for(let i = 0; i < this.mappedCryptoFunctions.length; i++) {
				if(cryptoClassFunctionCall.includes(this.mappedCryptoFunctions[i].func)) {
                    decryptedSignature = this.executeCryptoFunction(cryptoClassFunctionCall.substr(cryptoClassFunctionCall.indexOf(this.mappedCryptoFunctions[i].func)), 
                        this.mappedCryptoFunctions[i].action, decryptedSignature);
					break;
				}
			}
        });

		return decryptedSignature;
	}

	executeCryptoFunction(args, action, signature) {
        let items = new RegExp(",(.*?)\\)").exec(args);

        let arg = 0;

        if(items && items.length >= 2) {
            arg = items[1];
        }

		switch(action) {
			case 'splice':
				return this.splice(signature, arg);
			case 'reverse':
				return this.reverse(signature);
			case 'swap':
				return this.swap(signature, arg);
		}

		return signature;
	}

    splice(a, b) {
        return a.substr(b);
    }

    reverse(a) {
        return a.split('').reverse().join('');
    }

    swap(a, b) {
        let charArray = a.split('');

        let c = charArray[0];
        charArray[0] = charArray[b % charArray.length];
        charArray[b] = c;

        return charArray.join('');
    }
}