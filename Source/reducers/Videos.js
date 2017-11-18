import { RS_ADD_VIDEO, RS_REMOVE_VIDEO } from '../models/Constants';

const Videos = (state = [], action) => {
    switch (action.type) {
        case RS_ADD_VIDEO:
            let copy = state.slice();
            copy.push(action.video);
            return copy;
        case RS_REMOVE_VIDEO:
            state.splice(action.index, 1)
            return state.slice();
        default:
            return state
    }
}

export default Videos