const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

export default class VideoValidator {
    validateProperties(selectedVideoQuality, folderToSaveTo, renameVideoTo) {
        let result = {isvalid: true, message: ""};

        if(selectedVideoQuality == null) {
            result.isvalid = false;
            result.message = "Please choose a video quality";
        }
        else if(!folderToSaveTo || !electronFs.existsSync(folderToSaveTo)) {
            result.isvalid = false;
            result.message = "Folder to save to does not exist";
        }
        else if(!renameVideoTo || renameVideoTo.length === 0 || !renameVideoTo.trim()) {
            result.isvalid = false;
            result.message = "Rename to cannot be empty";
        }

        return result;
    }
}