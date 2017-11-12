import { combineReducers } from 'redux';

import UrlEntryState from './UrlEntryState';
import Videos from './Videos';

const Reducer = combineReducers({
    UrlEntryState,
    Videos
})

export default Reducer