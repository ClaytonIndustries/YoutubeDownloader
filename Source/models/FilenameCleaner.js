
export default class FilenameCleaner {
    clean(filename) {
        return filename.replace("\\u0026", "&")
                       .replace(/[\\/:"*?<>|]/g, "");
    }
}