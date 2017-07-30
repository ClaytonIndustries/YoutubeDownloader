import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import List, { ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from 'material-ui/List';
import Switch from 'material-ui/Switch';

export default class SettingsDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: this.props.settings
        };
    }

    onToggleClicked(toggle) {
        this.setState({
            settings: {
                automaticallyPaste: toggle === "paste" ? !this.state.settings.automaticallyPaste : this.state.settings.automaticallyPaste,
                automaticallyGetVideo: toggle === "get" ? !this.state.settings.automaticallyGetVideo : this.state.settings.automaticallyGetVideo,
                automaticallyDownload: toggle === "download" ? !this.state.settings.automaticallyDownload : this.state.settings.automaticallyDownload
            }
        });
    }

    componentWillReceiveProps() {
        this.setState({
            settings: this.props.settings
        });
    }

    render() {
        const styleSheet = this.getStyles();

        return (
            <Dialog open={this.props.open} onRequestClose={() => this.props.onClose(false, this.state.settings)}>
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
                    <Button color="primary" onClick={() => this.props.onClose(true, this.state.settings)}>
                        Ok
                    </Button>
                    <Button color="primary" onClick={() => this.props.onClose(false, this.state.settings)}>
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
    settings: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired
};