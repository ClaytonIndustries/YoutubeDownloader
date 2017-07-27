import React from 'react';
import ReactDOM from 'react-dom';
import { blue, orange } from 'material-ui/colors';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import createPalette from 'material-ui/styles/palette';

import Header from './Header';
import TabContainer from './TabContainer';

import SettingsManager from '../util/SettingsManager';

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
            palette: createPalette({
                primary: blue,
                accent: orange
            }),
        });

        const containerStyle = {
            marginLeft: 5,
            marginRight: 5,
            marginTop: 5,
            marginBottom: 0
        };

        return (
            <MuiThemeProvider theme={theme}>
                <div style={containerStyle}>
                    <Header settings={this.state.settings} onSettingsChanged={(settings) => this.settingsChanged(settings)} />
                    <TabContainer settings={this.state.settings} />
                </div>
            </MuiThemeProvider>
        );
    }
}