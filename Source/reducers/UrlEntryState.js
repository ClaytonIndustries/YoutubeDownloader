import { RS_URL_ENTRY_SAVE_STATE } from '../models/Constants';

const UrlEntryState = (state = null, action) => {
    switch (action.type) {
        case RS_URL_ENTRY_SAVE_STATE:
            return Object.assign({}, action.screenState);
        default:
            return state
    }
}

export default UrlEntryState