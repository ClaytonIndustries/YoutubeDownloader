import React from 'react';
import ReactDOM from 'react-dom';

import Button from 'material-ui/Button';
import Input from 'material-ui/Input/Input';
import { LinearProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import { FormGroup, FormControlLabel } from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import Menu, { MenuItem } from 'material-ui/Menu';

import ActionMenu from './ActionMenu';

import YoutubeUrlParser from '../util/YoutubeUrlParser';

const { clipboard, dialog, getCurrentWindow } = window.require('electron').remote;

export default class UrlEntry extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            youtubeUrl: '',
            videoQualities: ['sfsfsdfdfdfddfdfdfdfdfdfffdfdf', 'sfsfsdfdfdfddfdfdfdfdfdfffdfdf', 'sfsfsdfdfdfddfdfdfdfdfdfffdfdf'],
            audioTypes: ['sfsfsdfdfdfddfdfdfdfdfdfffdfdf', 'sfsfsdfdfdfddfdfdfdfdfdfffdfdf', 'sfsfsdfdfdfddfdfdfdfdfdfffdfdf'],
            videoQualityMenuOpen: false,
            audioTypeMenuOpen: false,
            menuAnchor: null,
            selectedVideoQuality: 'None Selected',
            selectedAudioType: 'Do Not Convert',
            saveTo: '',
            renameTo: '',
            startTime: 0,
            endTime: 0,
            loading: false
        };

        this.youtubeUrlParser = new YoutubeUrlParser();
    }

    showVideoQualityMenu(event) {
        this.setState({
            videoQualityMenuOpen: true,
            menuAnchor: event.currentTarget
        });
    }

    showAudioTypeMenu(event) {
        this.setState({
            audioTypeMenuOpen: true,
            menuAnchor: event.currentTarget
        });
    }

    videoQualityMenuClosed(index) {
        this.setState({
            videoQualityMenuOpen: false,
            selectedVideoQuality : index != undefined ? this.state.videoQualities[index] : this.state.selectedVideoQuality
        });
    }

    audioTypeMenuClosed(index) {
        this.setState({
            audioTypeMenuOpen: false,
            selectedAudioType : index != undefined ? this.state.audioTypes[index] : this.state.selectedAudioType
        });
    }

    paste() {
        this.setState({
            youtubeUrl: clipboard.readText()        
        });
    }

    getVideo() {
        this.youtubeUrlParser.parse(this.state.youtubeUrl);
    }

    selectSaveFolder() {
        dialog.showOpenDialog(getCurrentWindow(), {properties: ['openDirectory']}, (folder) => {
            if(folder != undefined) {
                this.setState({
                    saveTo: folder
                });
            }
        });
    }

    download() {
    }

    render() {
        const topSpacingStyle = {
            marginTop: 15
        };

        const leftItemStyle = {
            width: '49.5%',
            marginRight: '0.5%'
        };

        const rightItemStyle = {
            width: '49.5%',
            marginLeft: '0.5%'
        };

        const rowStyle = {
            display: 'flex'
        };

        const fullWidthStyle = {
            display: 'flex',
            flexDirection: 'column',
            flex: '1 0 auto',
        };

        const menuButtonStyle = {
            width: '50%',
            background: '#EDEDED'
        };

        const downloadButtonStyle = {
            width: '100%',
            marginTop: 100,
            height: 45
        };

        return (
            <div>
                <div style={topSpacingStyle}>
                    <Input fullWidth placeholder="Enter the video url here and press get video" value={this.state.youtubeUrl} 
                        onChange={(event) => {this.setState({youtubeUrl: event.target.value})}} />
                </div>
                <div style={topSpacingStyle}>
                    <Button raised color="primary" style={leftItemStyle} onClick={() => {this.paste()}}>PASTE</Button>
                    <Button raised color="primary" style={rightItemStyle} onClick={() => {this.getVideo()}}>GET VIDEO</Button>
                </div>
                <div style={topSpacingStyle}>
                    <LinearProgress />
                </div>
                <div style={topSpacingStyle}>
                    <div style={rowStyle}>
                        <Typography type="subheading" style={fullWidthStyle}>Choose a video quality</Typography>
                        <Button style={menuButtonStyle} onClick={(event) => {this.showVideoQualityMenu(event)}}>{this.state.selectedVideoQuality}</Button>
                        <ActionMenu items={this.state.videoQualities} open={this.state.videoQualityMenuOpen} anchor={this.state.menuAnchor} 
                            onClose={(index) => {this.videoQualityMenuClosed(index)}} />
                    </div>
                </div>
                <div style={topSpacingStyle}>
                    <div style={rowStyle}>
                        <Typography type="subheading" style={fullWidthStyle}>Automatically convert to</Typography>
                        <Button style={menuButtonStyle} onClick={(event) => {this.showAudioTypeMenu(event)}}>{this.state.selectedAudioType}</Button>
                        <ActionMenu items={this.state.audioTypes} open={this.state.audioTypeMenuOpen} anchor={this.state.menuAnchor} 
                            onClose={(index) => {this.audioTypeMenuClosed(index)}} />
                    </div>
                </div>
                <div>
                    <div style={rowStyle}>
                        <TextField fullWidth label="Save to" margin="dense" value={this.state.saveTo} onClick={() => {this.selectSaveFolder()}}
                            onChange={(event) => {this.setState({saveTo: event.target.value})}} />
                    </div>
                    <div style={rowStyle}>
                        <TextField fullWidth label="Rename to" margin="dense" value={this.state.renameTo} 
                            onChange={(event) => {this.setState({renameTo: event.target.value})}} />
                    </div>
                </div>
                <div style={topSpacingStyle}>
                    <Typography type="subheading">Modify start / end time (enter time in seconds, you do not need to enter both)</Typography>
                    <div style={rowStyle}>
                        <TextField label="Start Time" type="number" margin="dense" style={leftItemStyle} value={this.state.startTime} 
                            onChange={(event) => {this.setState({startTime: event.target.value})}} />
                        <TextField label="End Time" type="number" margin="dense" style={rightItemStyle} value={this.state.endTime} 
                            onChange={(event) => {this.setState({endTime: event.target.value})}} />
                    </div>
                </div>
                <div style={topSpacingStyle}>
                    <Button raised color="primary" style={downloadButtonStyle} onClick={() => this.download()}>DOWNLOAD</Button>
                </div>
            </div>
        );
    }
}