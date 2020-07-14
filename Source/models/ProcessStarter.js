const execFile = window.require('child_process').execFile;
const { shell } = window.require('electron');

export function startProcess(path, args, callback) {
    return execFile(path, args, (error) => {
        if(callback) callback(error ? false : true);
    });
}

export function openItem(path) {
    shell.openPath(path);
}