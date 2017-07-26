const { clipboard } = window.require('electron').remote;

export default class ClipboardManager {
    register(callback) {
        this.lastText = clipboard.readText();
        this.callback = callback;

        this.checkClipboard();
    }

    checkClipboard() {
        let newText = clipboard.readText();
        if(newText !== this.lastText) {
            this.lastText = newText;
            if(new RegExp("https://www.youtube.com/watch?").test(newText)) {
                this.callback();
            }
        }
        setTimeout(() => this.checkClipboard(), 500);
    }

    readText() {
        return clipboard.readText();
    }
}