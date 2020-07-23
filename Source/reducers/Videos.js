import { RS_ADD_VIDEO, RS_REMOVE_VIDEO } from '../models/Constants';

const videos = (state = [], action) => {
    switch (action.type) {
        case RS_ADD_VIDEO:
            return [
                ...state,
                action.video
            ];
        case RS_REMOVE_VIDEO:
            state.splice(action.index, 1);
            return state.slice();
        default:
            return state;
    }
};

export default videos;