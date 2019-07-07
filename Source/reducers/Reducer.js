import { combineReducers } from 'redux';

import AppSettings from './AppSettings';
import UrlEntryState from './UrlEntryState';
import Videos from './Videos';
import QueuedVideos from './QueuedVideos';

const Reducer = combineReducers({
    AppSettings,
    UrlEntryState,
    Videos,
    QueuedVideos
})

export default Reducer