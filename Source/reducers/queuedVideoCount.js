import { RS_QUEUED_VIDEOS } from '../models/Constants';

const queuedVideoCount = (state = 0, action) => {
    switch (action.type) {
        case RS_QUEUED_VIDEOS:
            return action.queuedVideoCount;
        default:
            return state;
    }
}

export default queuedVideoCount