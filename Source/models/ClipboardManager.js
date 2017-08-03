const { clipboard } = window.require('electron').remote;

export default class ClipboardManager {
    constructor() {
        this.callback;
        this.lastText = "";
        this.checkClipboard();
    }

    checkClipboard() {
        let newText = clipboard.readText();
        if(newText !== this.lastText) {
            if(new RegExp("https://www.youtube.com/watch?").test(newText)) {
                this.lastText = newText;
                if(this.callback) this.callback();
            }
        }
        setTimeout(() => this.checkClipboard(), 500);
    }

    readText() {
        return clipboard.readText();
    }
}