const { remote } = window.require('electron');
const electronFs = remote.require('fs');

export function remove(path) {
    electronFs.unlinkSync(path);
}

export function exists(path) {
    return electronFs.existsSync(path);
}

export function read(path) {
    return new Promise((resolve, reject) => {
        electronFs.readFile(path, 'utf-8', (error, data) => {
            if (error) {
                reject(new Error(error));
            } else {
                resolve(data);
            }
        });
    });
}

export function rename(sourcePath, newPath) {
    electronFs.renameSync(sourcePath, newPath);
}

export function write(path, value) {
    return new Promise((resolve, reject) => {
        electronFs.writeFile(path, value, (error) => {
            if (error) {
                reject(new Error(error));
            } else {
                resolve();
            }
        });
    });
}

export function getPath(dir) {
    return remote.app.getPath(dir);
}