import React from 'react';
import { orange } from '@material-ui/core/colors';
import { MuiThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles';

import Header from './Header';
import TabContainer from './TabContainer';
import Updater from './Updater';
import DownloadManager from './DownloadManager';
import Settings from './Settings';

const useStyles = makeStyles(() => ({
    container: {
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        marginBottom: 0
    }
}));

const App = () => {
    const classes = useStyles();

    const theme = createMuiTheme({
        palette: {
            primary: {
                main: '#5f50e1'
            },
            secondary: orange
        }
    });

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
};

export default App;