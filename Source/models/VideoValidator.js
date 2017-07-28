const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

export default class VideoValidator {
    validateProperties(selectedVideoQuality, folderToSaveTo, renameVideoTo, startTime, endTime) {
        let result = {isValid: true, message: ""};

        if(selectedVideoQuality == null) {
            result.isValid = false;
            result.message = "Please choose a video quality";
        }
        else if(!folderToSaveTo || !electronFs.existsSync(folderToSaveTo)) {
            result.isValid = false;
            result.message = "Folder to save to does not exist";
        }
        else if(!renameVideoTo || renameVideoTo.length === 0 || !renameVideoTo.trim()) {
            result.isValid = false;
            result.message = "Rename to cannot be empty";
        }
        else if(!new RegExp("^[0-9]+$").test(startTime)) {
            result.isValid = false;
            result.message = "Start time must be a number";
        }
        else if(!new RegExp("^[0-9]+$").test(endTime)) {
            result.isValid = false;
            result.message = "End time must be a number";
        }

        return result;
    }
}