const execFile = window.require('child_process').execFile;
const { shell } = window.require('electron');

export default class ProcessStarter {
    start(path, args, callback) {
        return execFile(path, args, (error, stdout, stderr) => {
            if(callback) callback(error ? false : true);
        });
    }

    openItem(path) {
        shell.openItem(path);
    }
}