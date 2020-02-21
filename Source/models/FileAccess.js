const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

export default class FileAccess {
    delete(path) {
        electronFs.unlinkSync(path);
    }

    exists(path) {
        return electronFs.existsSync(path);
    }

    read(path, callback) {
        electronFs.readFile(path, "utf-8", (error, data) => {
            if(callback) callback(error, data);
        });
    }

    rename(sourcePath, newPath) {
        electronFs.renameSync(sourcePath, newPath);
    }

    write(path, value, callback) {
        electronFs.writeFile(path, value, (error) => {
            if(callback) callback(error);
        });      
    }

    getPath(dir) {
        return remote.app.getPath(dir);
    }
}