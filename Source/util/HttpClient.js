
export default class HttpClient {
    get(url, callback) {
        let httpRequest = new XMLHttpRequest();
         httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 2) {
                callback("size", httpRequest.getResponseHeader("Content-Length"));
            }          
        }
        httpRequest.onprogress = function (evt) {
            callback("progress", evt.loaded);
        }
        httpRequest.onload = function() {
            let byteArray = new Uint8Array(httpRequest.response);
            callback("complete", byteArray);
        }
        httpRequest.onerror = function() {
            callback("error");
        }
        httpRequest.open("GET", url, true);
        httpRequest.responseType = "arraybuffer";
        httpRequest.send();
    }
}