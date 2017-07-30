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

    settingsDialogClose(save, settings) {
        this.setState({
            settingsDialogOpen: false
        });
        
        if(save) {
            this.props.onSettingsChanged(settings);
        }
    }

    render() {
        const cardStyle = {
            display: 'flex',
            margin: 0
        };

        const imageStyle = {
          width: 90,
          height: 90  
        };

        const detailsStyle = {
            display: 'flex',
            flexDirection: 'column',
            flex: '1 0 auto'
        };

        const buttonStyle = {
            padding: 0,
            marginRight: 20
        };

        const settingIconStyle = {
            width: 35,
            height: 35
        };

        return (
            <div style={cardStyle}>
                <Button style={buttonStyle} onClick={() => {this.openYoutube()}}>
                    <img style={imageStyle} src={'images\\YoutubeIcon.png'} />
                </Button>
                <div style={detailsStyle}>
                    <Typography type="headline" color="secondary">Clayton Industries</Typography>
                    <Typography type="headline" color="secondary">Youtube Downloader</Typography>
                    <Typography type="headline" color="secondary">{"Version " + VERSION_NUMBER}</Typography>
                </div>
                <IconButton onClick={() => {this.setState({settingsDialogOpen: true})}}>
                    <DeleteIcon style={settingIconStyle} />
                </IconButton>
                <SettingsDialog open={this.state.settingsDialogOpen} settings={this.props.settings} 
                        onClose={(save, settings) => {this.settingsDialogClose(save, settings)}} />
            </div>
        );
    }
}

Header.propTypes = {
    settings: PropTypes.object.isRequired,
    onSettingsChanged: PropTypes.func.isRequired
};