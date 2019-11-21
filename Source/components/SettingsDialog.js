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

import SettingsManager from '../models/SettingsManager';
import { RS_APP_SETTINGS } from '../models/Constants';

const remote = window.require('electron').remote;

class SettingsDialog extends React.Component {
    constructor(props) {
        super(props);

        this.settingsManager = new SettingsManager();

        this.settingsManager.load().then((settings) => {
            this.props.dispatch({ type: RS_APP_SETTINGS, appSettings: settings });
        });
    }

    onToggleClicked(switchName) {
        this.setState({
            settings: {
                automaticallyPaste: switchName === "paste" ? !this.state.settings.automaticallyPaste : this.state.settings.automaticallyPaste,
                automaticallyGetVideo: switchName === "get" ? !this.state.settings.automaticallyGetVideo : this.state.settings.automaticallyGetVideo,
                automaticallyDownload: switchName === "download" ? !this.state.settings.automaticallyDownload : this.state.settings.automaticallyDownload,
                saveToPath: this.state.settings.saveToPath
            }
        });
    }

    openDevTools() {
        remote.getCurrentWindow().webContents.openDevTools();
    }

    onSave() {
        this.props.dispatch({ type: RS_APP_SETTINGS, appSettings: this.state.settings});
        this.props.onClose();       
    }

    componentWillReceiveProps(newProps) {
        this.settingsManager.save(newProps.settings);
        this.setState({
            settings: newProps.settings
        });
    }

    render() {
        const { classes } = this.props;

        if(!this.state) {
            return (null);
        }

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
                                <Switch color="primary" onClick={event => this.onToggleClicked('paste')} checked={this.state.settings.automaticallyPaste} />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Automatically get video" />
                            <ListItemSecondaryAction>
                                <Switch color="primary" onClick={event => this.onToggleClicked('get')} checked={this.state.settings.automaticallyGetVideo} />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Automatically download" />
                            <ListItemSecondaryAction>
                                <Switch color="primary" onClick={event => this.onToggleClicked('download')} checked={this.state.settings.automaticallyDownload} />
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