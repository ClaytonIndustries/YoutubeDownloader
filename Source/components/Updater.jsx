import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

import { VERSION_NUMBER, URL_VERSION } from '../models/Constants';

const useStyles = makeStyles(() => ({
    snackbarContent: {
        marginLeft: 150,
        marginRight: 150
    }
}));

const Updater = () => {
    const classes = useStyles();

    const [state, setState] = useState({
        open: false,
        message: 'An update is available'
    });

    const getFormattedVersionNumberFromString = (versionNumber) => Number(versionNumber.replace('.', ''));

    useEffect(() => {
        async function checkForUpdate() {
            try {
                const args = {
                    method: 'GET'
                };

                const response = await fetch(URL_VERSION, args);
                const update = await response.json();

                if (getFormattedVersionNumberFromString(update.data) > getFormattedVersionNumberFromString(VERSION_NUMBER)) {
                    setState({
                        ...state,
                        open: true
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
        checkForUpdate();
    }, []);

    const closeSnackbar = () => {
        setState({
            ...state,
            open: false
        });
    };

    const content = [
        <IconButton key="close" color="inherit" onClick={closeSnackbar}>
            <CloseIcon />
        </IconButton>
    ];

    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            open={state.open}>
            <SnackbarContent
                className={classes.snackbarContent}
                message={state.message}
                action={content} />
        </Snackbar>
    );
};

export default Updater;