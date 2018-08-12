import React from 'react';
import { orange } from '@material-ui/core/colors';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Header from './Header';
import TabContainer from './TabContainer';
import Updater from './Updater';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const theme = createMuiTheme({
            palette: {
                primary: {
                    main: '#5f50e1'
                },
                secondary: orange
            }
        });

        const styleSheet = this.getStyles();

        return (
            <MuiThemeProvider theme={theme}>
                <div style={styleSheet.container}>
                    <Header />
                    <TabContainer />
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