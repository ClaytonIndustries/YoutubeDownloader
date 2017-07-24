
export default class YoutubeUrlParser {
    parse(youtubeUrl, callback) {
        try {
            let videoId = new RegExp("v=(.*)").exec(youtubeUrl)[1];
            let request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if(request.readyState == 4) {
                    callback(true, JSON.parse(request.responseText));
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