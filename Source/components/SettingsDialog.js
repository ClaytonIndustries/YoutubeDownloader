import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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

const remote = window.require('electron').remote;

class SettingsDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = { ...this.props.settings }
    }

    onAutomaticallyPasteClicked() {
        this.setState({ automaticallyPaste: !this.state.automaticallyPaste });
    }

    onAutomaticallyGetVideoClicked() {
        this.setState({ automaticallyGetVideo: !this.state.automaticallyGetVideo });
    }

    onAutomaticallyDownloadClicked() {
        this.setState({ automaticallyDownload: !this.state.automaticallyDownload });
    }

    openDevTools() {
        remote.getCurrentWindow().webContents.openDevTools();
    }

    onSave() {
        this.props.dispatch(appSettings({
            ...this.props.settings,
            automaticallyPaste: this.state.automaticallyPaste,
            automaticallyGetVideo: this.state.automaticallyGetVideo,
            automaticallyDownload: this.state.automaticallyDownload,
        }));
        this.props.onClose();       
    }

    render() {
        const { classes } = this.props;

        return (
            <Dialog open={this.props.open} onClose={() => this.props.onClose()}>
                <DialogTitle>
                    Settings
                </DialogTitle>
                <DialogContent>
                     <List className={classes.list}>
                        <ListItem>
                            <ListItemText primary="Automatically paste" />
                            <ListItemSecondaryAction>
                                <Switch color="primary" onClick={() => this.onAutomaticallyPasteClicked()} checked={this.state.automaticallyPaste} />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Automatically get video" />
                            <ListItemSecondaryAction>
                                <Switch color="primary" onClick={() => this.onAutomaticallyGetVideoClicked()} checked={this.state.automaticallyGetVideo} />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Automatically download" />
                            <ListItemSecondaryAction>
                                <Switch color="primary" onClick={() => this.onAutomaticallyDownloadClicked()} checked={this.state.automaticallyDownload} />
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                    <div className={classes.devToolsButton}>
                        <Button variant="contained" size="medium" color="primary" onClick={() => this.openDevTools()}>OPEN DEV TOOLS</Button>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => this.props.onClose()}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={() => this.onSave()}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

const styles = theme => ({
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

SettingsDialog.mapStateToProps = (state) => {
    return {
        settings: state.appSettings
    }
}

export default connect(SettingsDialog.mapStateToProps)(withStyles(styles)(SettingsDialog));