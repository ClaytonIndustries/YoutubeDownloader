import { RS_URL_ENTRY_SAVE_STATE } from '../models/Constants';

const urlEntryState = (state = null, action) => {
    switch (action.type) {
        case RS_URL_ENTRY_SAVE_STATE:
            return Object.assign({}, state, action.screenState);
        default:
            return state;
    }
}

export default urlEntryState