const { clipboard } = window.require('electron').remote;

export function readText() {
    return clipboard.readText();
}

export function isYoutubeUrl(url) {
    return new RegExp('https://www.youtube.com/watch?').test(url);
}