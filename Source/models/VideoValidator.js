import { exists } from './FileAccess';

export default function validateProperties(selectedVideoQuality, folderToSaveTo, renameVideoTo, startTime, endTime) {
    const result = { isValid: true, message: '' };

    if (selectedVideoQuality == null) {
        result.isValid = false;
        result.message = 'Please choose a video quality';
    } else if (!folderToSaveTo || !exists(folderToSaveTo)) {
        result.isValid = false;
        result.message = 'Folder to save to does not exist';
    } else if (!renameVideoTo || renameVideoTo.length === 0 || !renameVideoTo.trim()) {
        result.isValid = false;
        result.message = 'Rename to cannot be empty';
    } else if (!new RegExp('^[0-9]+$').test(startTime)) {
        result.isValid = false;
        result.message = 'Start time must be a number';
    } else if (!new RegExp('^[0-9]+$').test(endTime)) {
        result.isValid = false;
        result.message = 'End time must be a number';
    } else if (new RegExp('[\\/:\'*?<>|]').test(renameVideoTo)) {
        result.isValid = false;
        result.message = 'Filename contains invalid characters';
    }

    return result;
}