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
import WarningDialog from './WarningDialog'

import YoutubeUrlParser from '../util/YoutubeUrlParser';
import AudioFormats from '../util/AudioFormats';
import VideoValidator from '../util/VideoValidator';

const { clipboard, dialog, getCurrentWindow, app } = window.require('electron').remote;

export default class UrlEntry extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            youtubeUrl: "",
            videoQualities: [],
            audioFormats: AudioFormats.getAllowedFormats(),
            videoQualityMenuOpen: false,
            audioTypeMenuOpen: false,
            menuAnchor: null,
            selectedVideoQuality: null,
            selectedAudioFormat: AudioFormats.getAllowedFormats()[0],
            saveTo: app.getPath("documents"),
            renameTo: "",
            startTime: 0,
            endTime: 0,
            mexVideoLength: 0,
            gettingVideo: false,
            warningDialogOpen: false,
            validationMessage: ""
        };

        this.youtubeUrlParser = new YoutubeUrlParser();
        this.videoValidator = new VideoValidator();
    }

    showVideoQualityMenu(event) {
        if(this.state.videoQualities.length > 0) {
            this.setState({
                videoQualityMenuOpen: true,
                menuAnchor: event.currentTarget
            });
        }
    }

    showAudioTypeMenu(event) {
        if(this.state.audioFormats.length > 0) {
            this.setState({
                audioTypeMenuOpen: true,
                menuAnchor: event.currentTarget
            });
        }
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
            selectedAudioFormat : index != undefined ? this.state.audioFormats[index] : this.state.selectedAudioFormat
        });
    }

    paste() {
        this.setState({
            youtubeUrl: clipboard.readText()        
        });
    }

    getVideo() {
        if(!this.state.gettingVideo) {
            this.setState({
                gettingVideo: true
            }, () => {
                this.youtubeUrlParser.parse(this.state.youtubeUrl, (success, result) => {
                    if(success && result.videoQualities && result.videoQualities.length > 0) {
                        this.setState({
                            videoQualities: result.videoQualities,
                            selectedVideoQuality: result.videoQualities[0],
                            renameTo: result.title,
                            endTime: result.videoLength,
                            mexVideoLength: result.videoLength
                        });
                    }

                    this.setState({
                       gettingVideo: false
                    });
                });
            });       
        }
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
        let validationResult = this.videoValidator.validateProperties(this.state.selectedVideoQuality, this.state.saveTo, this.state.renameTo);

        if(validationResult.valid) {
            this.clearCurrentVideo();
        }
        else {
            this.setState({
                warningDialogOpen: true,
                validationMessage: validationResult.message
            });
        }
    }

    clearCurrentVideo() {
        this.setState({
            selectedVideoQuality: null,
            videoQualities: [],
            renameTo: "",
            startTime: 0,
            endTime: 0      
        });
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
            marginTop: 30,
            height: 40
        };

        return (
            <div>
                <div style={topSpacingStyle}>
                    <Input fullWidth placeholder="Enter the video url here and press get video" value={this.state.youtubeUrl} 
                        onChange={(event) => {this.setState({youtubeUrl: event.target.value})}} />
                </div>
                <div style={topSpacingStyle}>
                    <Button raised dense color="primary" style={leftItemStyle} onClick={() => {this.paste()}}>PASTE</Button>
                    <Button raised dense color="primary" style={rightItemStyle} onClick={() => {this.getVideo()}}>GET VIDEO</Button>
                </div>
                <div style={topSpacingStyle}>
                    <LinearProgress mode={this.state.gettingVideo ? "query" : "determinate"} />
                </div>
                <div style={topSpacingStyle}>
                    <div style={rowStyle}>
                        <Typography type="subheading" style={fullWidthStyle}>Choose a video quality</Typography>
                        <Button style={menuButtonStyle} onClick={(event) => {this.showVideoQualityMenu(event)}}>
                            {this.state.selectedVideoQuality != null ? this.state.selectedVideoQuality.description : "None Available"}
                        </Button>
                        <ActionMenu items={this.state.videoQualities} open={this.state.videoQualityMenuOpen} anchor={this.state.menuAnchor} selectedItem={this.state.selectedVideoQuality}
                            onClose={(index) => {this.videoQualityMenuClosed(index)}} />
                    </div>
                </div>
                <div style={topSpacingStyle}>
                    <div style={rowStyle}>
                        <Typography type="subheading" style={fullWidthStyle}>Automatically convert to</Typography>
                        <Button style={menuButtonStyle} onClick={(event) => {this.showAudioTypeMenu(event)}}>
                            {this.state.selectedAudioFormat != null ? this.state.selectedAudioFormat.description : "None Available"}
                        </Button>
                        <ActionMenu items={this.state.audioFormats} open={this.state.audioTypeMenuOpen} anchor={this.state.menuAnchor} selectedItem={this.state.selectedAudioFormat}
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
                    <Button raised dense color="primary" style={downloadButtonStyle} onClick={() => this.download()}>DOWNLOAD</Button>
                </div>
                <WarningDialog content={this.state.validationMessage} open={this.state.warningDialogOpen} 
                    onClose={() => this.setState({warningDialogOpen: false})} />
            </div>
        );
    }
}