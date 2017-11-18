import { RS_APP_SETTINGS } from '../models/Constants';

const AppSettings = (state = null, action) => {
    switch (action.type) {
        case RS_APP_SETTINGS:
            return Object.assign({}, action.appSettings);
        default:
            return state
    }
}

export default AppSettings