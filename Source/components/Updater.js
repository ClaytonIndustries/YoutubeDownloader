import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

import { VERSION_NUMBER, URL_VERSION } from '../models/Constants';

class Updater extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            message: "An update is available"
        };
    }

    async componentDidMount() {
        try {
            const args = {
                method: "GET"
            }
    
            let response = await fetch(URL_VERSION, args);
            let update = await response.json();
    
            if(this.getFormattedVersionNumberFromString(update.data) > this.getFormattedVersionNumberFromString(VERSION_NUMBER)) {
                this.setState({
                    open: true
                })
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    getFormattedVersionNumberFromString(versionNumber) {
        return Number(versionNumber.replace(".", ""));
    }

    closeSnackbar() {
        this.setState({
            open: false
        });
    }

    render() {
        const { classes } = this.props;

        const content =
            [
                <IconButton key="close" color="inherit" onClick={() => this.closeSnackbar()}>
                    <CloseIcon />
                </IconButton>
            ];

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={this.state.open}>               
                <SnackbarContent
                    className={classes.snackbarContent}
                    message={this.state.message}
                    action={content}>
                </SnackbarContent>
            </Snackbar>
        );
    }
}

const styles = () => ({
    snackbarContent: {
        marginLeft: 150,
        marginRight: 150
    }
});

export default withStyles(styles)(Updater);