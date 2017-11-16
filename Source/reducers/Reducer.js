import { combineReducers } from 'redux';

import AppSettings from './AppSettings';
import UrlEntryState from './UrlEntryState';
import Videos from './Videos';

const Reducer = combineReducers({
    AppSettings,
    UrlEntryState,
    Videos
})

export default Reducer