import { URL_PARSE, AUTH_CODE } from '../models/Constants';

export default class YoutubeUrlParser {
    parse(youtubeUrl, callback) {
        try {
            let videoId = new RegExp("v=(.*)").exec(youtubeUrl)[1];
            let request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if(request.readyState == 4) {
                    try
                    {
                        let response = JSON.parse(request.responseText);
                        callback(true, response);
                    }
                    catch(e) {
                        callback(false, null);
                    }
                }
            };
            request.open("GET", URL_PARSE + videoId, true);
            request.setRequestHeader("Authorization", AUTH_CODE);
            request.send();
        }
        catch(e) {
            callback(false, null);
        }
    }
}