
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
            request.open("GET", "http://claytoninds.com/services/youtubedownloader/parse/" + videoId, true);
            request.setRequestHeader("Authorization", "AEE3024137A829E1");
            request.send();
        }
        catch(e) {
            callback(false, null);
        }
    }
}