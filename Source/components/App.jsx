import React, { useEffect } from 'react';
import { orange } from '@material-ui/core/colors';
import { MuiThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles';
const { session } = window.require('electron').remote;

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

    useEffect(() => {
        async function setConsentCookie() {
            const cookie = { url: 'https://www.youtube.com', name: 'CONSENT', value: 'YES+cb.20210328-17-p0.en+FX+142', expirationDate: 1838215253 }
            await session.defaultSession.cookies.set(cookie);
        }
        setConsentCookie();
    }, []);

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