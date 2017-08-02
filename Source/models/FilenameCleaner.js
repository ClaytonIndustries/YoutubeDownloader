
export default class FilenameCleaner {
    clean(filename) {
        return filename.replace(/[\\/:"*?<>|]/g, "");
    }
}