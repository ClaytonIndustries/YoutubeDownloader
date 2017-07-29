import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import Snackbar, { SnackbarContent } from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import { LinearProgress } from 'material-ui/Progress';

import Slide from 'material-ui/transitions/Slide';

import CloseIcon from 'material-ui-icons/Close';

import UpdateManager from '../models/UpdateManager';
import ProcessStarter from '../models/ProcessStarter';

import { UD_UPDATE_AVAILABLE, UD_DOWNLOADING_UPDATE, UD_RETRY_DOWNLOAD, UD_INSTALL_READY } from '../models/Constants';

const remote = window.require('electron').remote;

export default class Updater extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            update: null,
            message: "A new version is available",
            status: UD_UPDATE_AVAILABLE
        };

        this.updateManager = new UpdateManager();
        this.processStarter = new ProcessStarter();

        this.updateManager.checkForUpdates((update) => {
            if(update != undefined) {
                this.setState({
                    open: true,
                    update: update
                });
            }
        });
    }

    downloadUpdate() {
        this.setState({
            message: "Downloading update",
            status: UD_DOWNLOADING_UPDATE
        }, () => {
            this.activeDownload = this.updateManager.downloadUpdate(this.state.update, (success) => {
                if(success) {
                    this.setState({
                        message: "Download complete",
                        status: UD_INSTALL_READY
                    });
                }
                else {
                    this.setState({
                        message: "Download failed, retry?",
                        status: UD_RETRY_DOWNLOAD
                    });
                }
            });
        });
    }

    installUpdate() {
        this.processStarter.start(this.state.update.extractedLocation(), []);
        remote.getCurrentWindow().close();
    }

    handleRequestClose() {
        try {
            if(this.activeDownload && this.state.status === UD_DOWNLOADING_UPDATE) {
                this.activeDownload.abort();
            }
        }
        catch (e) {
        }

        this.setState({
            open: false
        });
    }

    render() {
        const snackbarContentStyle = {
            marginLeft: 150,
            marginRight: 150
        };

        const progressBarStyle = {
            width: 100
        };

        const content = this.state.status === UD_UPDATE_AVAILABLE || this.state.status === UD_RETRY_DOWNLOAD ? 
            [
                <Button key="download" color="accent" dense onClick={() => {this.downloadUpdate()}}>
                    {this.state.status === "updateAvailable" ? "DOWNLOAD" : "RETRY"}
                </Button>,
                <IconButton key="close" color="inherit" onClick={() => {this.handleRequestClose()}}>
                    <CloseIcon />
                </IconButton>
            ]
        : this.state.status === UD_DOWNLOADING_UPDATE ?
            [
                <LinearProgress key="progress" style={progressBarStyle} />,
                <IconButton key="close" color="inherit" onClick={() => {this.handleRequestClose()}}>
                    <CloseIcon />
                </IconButton>
            ]
        :
            [
                <Button key="download" color="accent" dense onClick={() => {this.installUpdate()}}>
                    INSTALL
                </Button>,
                <IconButton key="close" color="inherit" onClick={() => {this.handleRequestClose()}}>
                    <CloseIcon />
                </IconButton>
            ];

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={this.state.open}
                transition={<Slide direction={'down'} />}>               
                <SnackbarContent
                    style={snackbarContentStyle}
                    message={this.state.message}
                    action={content}>
                </SnackbarContent>
            </Snackbar>
        );
    }
}
