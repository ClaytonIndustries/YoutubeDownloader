
export default class VideoDownloader {
    get(url, callback) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 2) {
                callback("size", httpRequest.getResponseHeader("Content-Length"));
            }          
        }
        httpRequest.onprogress = (evt) => {
            callback("progress", evt.loaded);
        }
        httpRequest.onload = () => {
            let byteArray = new Uint8Array(httpRequest.response);
            callback("complete", byteArray);
        }
        httpRequest.onerror = () => {
            callback("error");
        }
        httpRequest.onabort = () => {
            callback("error");
        };
        httpRequest.open("GET", url, true);
        httpRequest.responseType = "arraybuffer";
        httpRequest.send();

        return httpRequest;
    }
}