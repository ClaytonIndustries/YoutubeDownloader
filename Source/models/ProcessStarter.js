const { execFile } = window.require('child_process');
const { shell } = window.require('electron');

export function startProcess(path, args, signal) {
    return new Promise((resolve, reject) => {
        const process = execFile(path, args, (error) => {
            if (error) {
                reject(new Error(error));
            } else {
                resolve();
            }
        });

        signal.onabort = () => {
            process.kill();
        };
    });
}

export function openItem(path) {
    shell.openPath(path);
}