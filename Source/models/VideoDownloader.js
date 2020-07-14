
export function getVideo(url, callback) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 2) {
            callback("size", httpRequest.getResponseHeader("Content-Length"));
        }          
    }
    httpRequest.onload = () => {
        if(httpRequest.status == 200) {
            let byteArray = new Uint8Array(httpRequest.response);
            callback("complete", byteArray);
        }
        else {
            callback("error");
        }
    }
    httpRequest.onprogress = (evt) => callback("progress", evt.loaded);
    httpRequest.onerror = () => callback("error");
    httpRequest.onabort = () => callback("error");
    httpRequest.open("GET", url, true);
    httpRequest.responseType = "arraybuffer";
    httpRequest.send();

    return httpRequest;
}