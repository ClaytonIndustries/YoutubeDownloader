import { RS_APP_SETTINGS } from '../models/Constants';

const appSettings = (state = null, action) => {
    switch (action.type) {
        case RS_APP_SETTINGS:
            return { ...state, ...action.settings };
        default:
            return state;
    }
};

export default appSettings;