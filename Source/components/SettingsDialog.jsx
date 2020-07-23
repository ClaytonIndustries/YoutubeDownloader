import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';

import { appSettings } from '../actions';

const { remote } = window.require('electron');

const SettingsDialog = (props) => {
    const {
        open, onClose, classes
    } = props;

    const settings = useSelector((state) => state.appSettings);

    const dispatch = useDispatch();

    const [state, setState] = useState({
        ...settings
    });

    const onAutomaticallyPasteClicked = () => {
        setState({ ...settings, automaticallyPaste: !state.automaticallyPaste });
    };

    const onAutomaticallyGetVideoClicked = () => {
        setState({ ...settings, automaticallyGetVideo: !state.automaticallyGetVideo });
    };

    const onAutomaticallyDownloadClicked = () => {
        setState({ ...settings, automaticallyDownload: !state.automaticallyDownload });
    };

    const openDevTools = () => {
        remote.getCurrentWindow().webContents.openDevTools();
    };

    const onSave = () => {
        dispatch(appSettings({
            ...settings,
            automaticallyPaste: state.automaticallyPaste,
            automaticallyGetVideo: state.automaticallyGetVideo,
            automaticallyDownload: state.automaticallyDownload,
        }));
        onClose();
    };

    return (
        <Dialog open={open} onClose={() => onClose()}>
            <DialogTitle>
                Settings
            </DialogTitle>
            <DialogContent>
                <List className={classes.list}>
                    <ListItem>
                        <ListItemText primary="Automatically paste" />
                        <ListItemSecondaryAction>
                            <Switch color="primary" onClick={() => onAutomaticallyPasteClicked()} checked={state.automaticallyPaste} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Automatically get video" />
                        <ListItemSecondaryAction>
                            <Switch color="primary" onClick={() => onAutomaticallyGetVideoClicked()} checked={state.automaticallyGetVideo} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Automatically download" />
                        <ListItemSecondaryAction>
                            <Switch color="primary" onClick={() => onAutomaticallyDownloadClicked()} checked={state.automaticallyDownload} />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
                <div className={classes.devToolsButton}>
                    <Button variant="contained" size="medium" color="primary" onClick={() => openDevTools()}>OPEN DEV TOOLS</Button>
                </div>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => onClose()}>
                    Cancel
                </Button>
                <Button color="primary" onClick={() => onSave()}>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const styles = () => ({
    list: {
        width: 300
    },
    devToolsButton: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px'
    }
});

SettingsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(SettingsDialog);