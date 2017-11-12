import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { blue, orange } from 'material-ui/colors';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

import Header from './Header';
import TabContainer from './TabContainer';
import Updater from './Updater';

import SettingsManager from '../models/SettingsManager';
import Videos from '../reducers/Reducer';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.settingsManager = new SettingsManager();
        
        this.state = {
            settings: this.settingsManager.settings
        };
    }

    settingsChanged(settings) {
        this.settingsManager.save(settings);

        this.setState({
            settings: Object.assign({}, settings)
        });
    }

    componentDidMount() {
        this.settingsManager.load((settings) => {
            this.setState({
                settings: settings
            });
        });
    }

    render() {
        let store = createStore(Videos);

        const theme = createMuiTheme({
            palette: {
                primary: blue,
                secondary: orange
            }
        });

        const styleSheet = this.getStyles();

        return (
            <Provider store={store}>
                <MuiThemeProvider theme={theme}>
                    <div style={styleSheet.container}>
                        <Header settings={this.state.settings} onSettingsChanged={(settings) => this.settingsChanged(settings)} />
                        <TabContainer settings={this.state.settings} />
                        <Updater />
                    </div>
                </MuiThemeProvider>
            </Provider>
        );
    }

    getStyles() {
        return {
            container: {
                marginLeft: 5,
                marginRight: 5,
                marginTop: 5,
                marginBottom: 0
            }
        };
    }
}