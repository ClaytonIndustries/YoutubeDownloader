import React from 'react';
import ReactDOM from 'react-dom';
import { blue, orange } from 'material-ui/colors';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import createPalette from 'material-ui/styles/palette';

import Header from './Header';
import TabContainer from './TabContainer';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
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
                    <Header />
                    <TabContainer />
                </div>
            </MuiThemeProvider>
        );
    }
}