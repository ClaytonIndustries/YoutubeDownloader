import React from 'react';
import ReactDOM from 'react-dom';
import { blue, orange } from 'material-ui/colors';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

import Header from './Header';
import TabContainer from './TabContainer';
import Updater from './Updater';

import SettingsManager from '../models/SettingsManager';

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
        const theme = createMuiTheme({
            palette: {
                primary: blue,
                secondary: orange
            }
        });

        const styleSheet = this.getStyles();

        return (
            <MuiThemeProvider theme={theme}>
                <div style={styleSheet.container}>
                    <Header settings={this.state.settings} onSettingsChanged={(settings) => this.settingsChanged(settings)} />
                    <TabContainer settings={this.state.settings} />
                    <Updater />
                </div>
            </MuiThemeProvider>
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