import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import App from './components/App';
import Reducer from './reducers/Reducer';

require('./index.css');

let store = createStore(Reducer);

ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('app')); 