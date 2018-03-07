import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

import DeleteIcon from 'material-ui-icons/Settings';

import SettingsDialog from './SettingsDialog';

import ProcessStarter from '../models/ProcessStarter';
import { VERSION_NUMBER } from '../models/Constants';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settingsDialogOpen: false
        };

        this.processStarter = new ProcessStarter();
    }

    openYoutube() {
        this.processStarter.openItem("https://www.youtube.com");
    }

    settingsDialogClose() {
        this.setState({
            settingsDialogOpen: false
        });
    }

    render() {
        const styleSheet = this.getStyles();

        return (
            <div style={styleSheet.card}>
                <Button style={styleSheet.button} onClick={() => {this.openYoutube()}}>
                    <img style={styleSheet.image} src={'images\\YoutubeIcon.png'} />
                </Button>
                <div style={styleSheet.details}>
                    <Typography variant="headline" color="textSecondary">Clayton Industries</Typography>
                    <Typography variant="headline" color="textSecondary">Youtube Downloader</Typography>
                    <Typography variant="headline" color="textSecondary">{"Version " + VERSION_NUMBER}</Typography>
                </div>
                <IconButton onClick={() => {this.setState({settingsDialogOpen: true})}}>
                    <DeleteIcon style={styleSheet.settingIcon} />
                </IconButton>
                <SettingsDialog open={this.state.settingsDialogOpen} onClose={() => {this.settingsDialogClose()}} />
            </div>
        );
    }

    getStyles() {
        return {
            card: {
                display: 'flex',
                margin: 0
            },
            image: {
                width: 90,
                height: 90
            },
            details: {
                display: 'flex',
                flexDirection: 'column',
                flex: '1 0 auto'
            },
            button: {
                padding: 0,
                marginRight: 20
            },
            settingIcon: {
                width: 35,
                height: 35
            }
        };
    }
}