
export default class FilenameCleaner {
    clean(filename) {
        if (!filename) {
            return undefined;
        }

        return filename.replace("\\u0026", "&")
                       .replace(/[\\/:"*?<>|]/g, "");
    }
}