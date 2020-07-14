const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

export function remove(path) {
    electronFs.unlinkSync(path);
}

export function exists(path) {
    return electronFs.existsSync(path);
}

export function read(path, callback) {
    electronFs.readFile(path, "utf-8", (error, data) => {
        if(callback) callback(error, data);
    });
}

export function rename(sourcePath, newPath) {
    electronFs.renameSync(sourcePath, newPath);
}

export function write(path, value, callback) {
    electronFs.writeFile(path, value, (error) => {
        if(callback) callback(error);
    });      
}

export function getPath(dir) {
    return remote.app.getPath(dir);
}