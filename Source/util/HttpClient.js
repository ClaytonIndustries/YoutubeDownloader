
export default class HttpClient {
    get(url, callback) {
        let httpRequest = new XMLHttpRequest();
         httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 2) {
                callback("size", httpRequest.getResponseHeader("Content-Length"));
            }
            else if(httpRequest.readyState == 4) {
                let byteArray = new Uint8Array(httpRequest.response);
                callback("done", byteArray);
            }           
        }
        httpRequest.onprogress = function (evt) {
            callback("progress", evt.loaded);
        }
        httpRequest.open("GET", url, true);
        httpRequest.responseType = "arraybuffer";
        httpRequest.send();
    }
}