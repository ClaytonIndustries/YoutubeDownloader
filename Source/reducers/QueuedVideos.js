import { RS_QUEUED_VIDEOS } from '../models/Constants';

const QueuedVideos = (state = 0, action) => {
    switch (action.type) {
        case RS_QUEUED_VIDEOS:
            return action.queuedVideos;
        default:
            return state
    }
}

export default QueuedVideos