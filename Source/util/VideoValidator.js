const remote = window.require('electron').remote;
const electronFs = remote.require('fs');

export default class VideoValidator {
    validateProperties(selectedVideoQuality, folderToSaveTo, renameVideoTo, startTime, endTime) {
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
        else if(!isNumber(startTime)) {
            result.isvalid = false;
            result.message = "Start time must be a number";
        }
        else if(!isNumber(endTime)) {
            result.isvalid = false;
            result.message = "End time must be a number";
        }

        return result;
    }
}