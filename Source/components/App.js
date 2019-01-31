import React from 'react';
import { orange } from '@material-ui/core/colors';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';

import Header from './Header';
import TabContainer from './TabContainer';
import Updater from './Updater';

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
            },
            typography: {
                useNextVariants: true,
            }
        });

        const { classes } = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                <div className={classes.container}>
                    <Header />
                    <TabContainer />
                    <Updater />
                </div>
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