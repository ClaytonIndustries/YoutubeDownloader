import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import Input from 'material-ui/Input/Input';
import { LinearProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
import Checkbox from 'material-ui/Checkbox';
import { FormGroup, FormControlLabel } from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import Menu, { MenuItem } from 'material-ui/Menu';
import Avatar from 'material-ui/Avatar';

import CheckIcon from 'material-ui-icons/Check';
import CrossIcon from 'material-ui-icons/Close';
import SearchIcon from 'material-ui-icons/Search';

import green from 'material-ui/colors/green';
import red from 'material-ui/colors/red';
import grey from 'material-ui/colors/grey';

import ActionMenu from './ActionMenu';
import WarningDialog from './WarningDialog';
import NumericTextField from './NumericTextField';

import YoutubeUrlParser from '../util/YoutubeUrlParser';
import AudioFormats from '../util/AudioFormats';
import VideoValidator from '../util/VideoValidator';
import YoutubeVideo from '../util/YoutubeVideo';
import ClipboardManager from '../util/ClipboardManager';
import { VS_PENDING } from '../util/VideoState';

const { dialog, getCurrentWindow, app } = window.require('electron').remote;

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
            startTime: "0",
            endTime: "0",
            maxVideoLength: 0,
            videoId: "",
            gettingVideo: false,
            warningDialogOpen: false,
            validationMessage: "",
            searchStatus: "pending"
        };

        this.youtubeUrlParser = new YoutubeUrlParser();
        this.videoValidator = new VideoValidator();
        this.clipboardManager = new ClipboardManager();
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
            youtubeUrl: this.clipboardManager.readText()     
        }, () => {
            if(this.props.settings.automaticallyGetVideo) {
                this.getVideo();
            }
        });
    }

    getVideo() {
        if(!this.state.gettingVideo) {
            this.clearCurrentVideo();
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
                            maxVideoLength: result.videoLength,
                            videoId: result.id
                        }, () => {
                            if(this.props.settings.automaticallyDownload) {
                                this.download();
                            }
                        });
                    }

                    this.setState({
                       gettingVideo: false,
                       searchStatus: success && result.videoQualities.length > 0 ? "success" : "failed"
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

    validateStartAndEndTime(value, field) {
        let valueAsNumber = Number(value);
        if(field === "start") {
            let endTime = Number(this.state.endTime);

            if(valueAsNumber > this.state.maxVideoLength) {
                valueAsNumber = this.state.maxVideoLength;
            }
            
            if(endTime < valueAsNumber) {
                endTime = valueAsNumber;
            }

            this.setState({
                startTime: valueAsNumber.toString(),
                endTime: endTime.toString()
            });
        }
        else {
            let startTime = Number(this.state.startTime);

            if(valueAsNumber > this.state.maxVideoLength) {
                valueAsNumber = this.state.maxVideoLength;
            }

            if(startTime > valueAsNumber) {
                startTime = valueAsNumber;
            }

            this.setState({
                endTime: valueAsNumber.toString(),
                startTime: startTime.toString()
            });
        }
    }

    componentDidMount() {
        this.clipboardManager.callback= () => {
            if(this.props.settings.automaticallyPaste) {
                this.paste();
            }
        };
    }

    componentWillUnmount() {
        this.clipboardManager.callback = null;
    }

    download() {
        let validationResult = this.videoValidator.validateProperties(this.state.selectedVideoQuality, this.state.saveTo, 
            this.state.renameTo, this.state.startTime, this.state.endTime);

        if(validationResult.isValid) {
            let youtubeVideo = new YoutubeVideo();
            youtubeVideo.title = this.state.renameTo;
            youtubeVideo.videoId = this.state.videoId;
            youtubeVideo.destinationFolder = this.state.saveTo;
            youtubeVideo.audioFormat = this.state.selectedAudioFormat;
            youtubeVideo.videoQuality = this.state.selectedVideoQuality;
            youtubeVideo.youtubeUrl = this.state.youtubeUrl;
            youtubeVideo.startTime = this.state.startTime;
            youtubeVideo.originalEndTime = this.state.maxVideoLength;
            youtubeVideo.newEndTime = this.state.endTime;
            youtubeVideo.status = VS_PENDING;

            this.props.onDownload(youtubeVideo);

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
            startTime: "0",
            endTime: "0",
            maxVideoLength: 0,
            videoId: "",
            searchStatus: "pending"   
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

        const statusIndicatorStyle = {
            background: this.state.searchStatus == "success" ? green[500] : this.state.searchStatus == "failed" ? red[500] : grey[500] 
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
                    <div style={rowStyle}>
                        <Input fullWidth placeholder="Enter the video url here and press get video" value={this.state.youtubeUrl} 
                            onChange={(event) => {this.setState({youtubeUrl: event.target.value})}} />
                        <Avatar style={statusIndicatorStyle}>
                            {this.state.searchStatus == "success" ? <CheckIcon /> : this.state.searchStatus == "failed" ? <CrossIcon /> : <SearchIcon /> }
                        </Avatar>           
                    </div>
                </div>
                <div style={topSpacingStyle}>
                    <Button raised dense color="primary" style={leftItemStyle} onClick={() => {this.paste()}}>PASTE</Button>
                    <Button raised dense disabled={this.state.gettingVideo} color="primary" style={rightItemStyle} 
                        onClick={() => {this.getVideo()}}>
                        GET VIDEO
                    </Button>
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
                        <NumericTextField label={"Start Time"} style={leftItemStyle} value={this.state.startTime} 
                            onChange={(value) => {this.validateStartAndEndTime(value, "start")}}  />
                        <NumericTextField label={"End Time"} style={rightItemStyle} value={this.state.endTime} 
                            onChange={(value) => {this.validateStartAndEndTime(value, "end")}}  />
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

UrlEntry.propTypes = {
    settings: PropTypes.object.isRequired,
    onDownload: PropTypes.func.isRequired
};