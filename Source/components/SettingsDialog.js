import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import List, { ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from 'material-ui/List';
import Switch from 'material-ui/Switch';

import SettingsManager from '../models/SettingsManager';

class SettingsDialog extends React.Component {
    constructor(props) {
        super(props);

        this.settingsManager = new SettingsManager();

        this.settingsManager.load((settings) => {
            this.props.dispatch({type: "APP_SETTINGS_UPDATE", appSettings: settings});
        });
    }

    onToggleClicked(switchName) {
        this.setState({
            settings: {
                automaticallyPaste: switchName === "paste" ? !this.state.settings.automaticallyPaste : this.state.settings.automaticallyPaste,
                automaticallyGetVideo: switchName === "get" ? !this.state.settings.automaticallyGetVideo : this.state.settings.automaticallyGetVideo,
                automaticallyDownload: switchName === "download" ? !this.state.settings.automaticallyDownload : this.state.settings.automaticallyDownload
            }
        });
    }

    onSave() {
        let settings = this.state.settings;
        this.props.dispatch({type: "APP_SETTINGS_UPDATE", appSettings: settings});
        this.settingsManager.save(settings);
        this.props.onClose();
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            settings: newProps.settings
        });
    }

    render() {
        const styleSheet = this.getStyles();

        if(!this.state) {
            return (null);
        }

        return (
            <Dialog open={this.props.open} onRequestClose={() => this.props.onClose()}>
                <DialogTitle>
                    Settings
                </DialogTitle>
                <DialogContent>
                     <List style={styleSheet.list}>
                        <ListItem>
                            <ListItemText primary="Automatically paste" />
                            <ListItemSecondaryAction>
                                <Switch onClick={event => this.onToggleClicked('paste')} checked={this.state.settings.automaticallyPaste} />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Automatically get video" />
                            <ListItemSecondaryAction>
                                <Switch onClick={event => this.onToggleClicked('get')} checked={this.state.settings.automaticallyGetVideo} />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Automatically download" />
                            <ListItemSecondaryAction>
                                <Switch onClick={event => this.onToggleClicked('download')} checked={this.state.settings.automaticallyDownload} />
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={() => this.onSave()}>
                        Ok
                    </Button>
                    <Button color="primary" onClick={() => this.props.onClose()}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    getStyles() {
        return {
            list: {
                width: 300
            }
        };
    }
}

SettingsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

SettingsDialog.mapStateToProps = (state) => {
    return {
        settings: state.AppSettings
    }
}

export default connect(SettingsDialog.mapStateToProps)(SettingsDialog);