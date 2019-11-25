import React from 'react';
import { orange } from '@material-ui/core/colors';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';

import Header from './Header';
import TabContainer from './TabContainer';
import Updater from './Updater';
import DownloadManager from './DownloadManager';
import Settings from './Settings';

class App extends React.Component {
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

        const { classes } = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                <Settings>
                    <div className={classes.container}>
                        <Header />
                        <TabContainer />
                        <Updater />
                        <DownloadManager />
                    </div>
                </Settings>
            </MuiThemeProvider>
        );
    }
}

const styles = theme => ({
    container: {
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        marginBottom: 0
    }
});

export default withStyles(styles)(App);