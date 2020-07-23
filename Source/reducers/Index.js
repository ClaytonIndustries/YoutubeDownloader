import { combineReducers } from 'redux';

import appSettings from './appSettings';
import urlEntryState from './urlEntryState';
import videos from './videos';
import queuedVideoCount from './queuedVideoCount';

export default combineReducers({
    appSettings,
    urlEntryState,
    videos,
    queuedVideoCount
});