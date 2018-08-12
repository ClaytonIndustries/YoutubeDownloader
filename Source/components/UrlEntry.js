import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import SliderBase from 'rc-slider';

import ActionMenu from './ActionMenu';
import WarningDialog from './WarningDialog';

import AudioFormats from '../models/AudioFormats';
import VideoValidator from '../models/VideoValidator';
import YoutubeVideo from '../models/YoutubeVideo';
import ClipboardManager from '../models/ClipboardManager';
import FileAccess from '../models/FileAccess';
import { VS_PENDING, RS_ADD_VIDEO, RS_URL_ENTRY_SAVE_STATE, RS_APP_SETTINGS } from '../models/Constants';

const { dialog, getCurrentWindow } = window.require('electron').remote;

const createSliderWithTooltip = SliderBase.createSliderWithTooltip;
const Slider = createSliderWithTooltip(SliderBase);
const Range = createSliderWithTooltip(SliderBase.Range);

class UrlEntry extends React.Component {
    constructor(props) {
        super(props);

        this.videoValidator = new VideoValidator();
        this.clipboardManager = new ClipboardManager();
        this.fileAccess = new FileAccess();

        this.state = {
            youtubeUrl: "",
            videoQualities: [],
            audioFormats: AudioFormats.getAllowedFormats(),
            videoQualityMenuOpen: false,
            audioTypeMenuOpen: false,
            menuAnchor: null,
            selectedVideoQuality: null,
            selectedAudioFormat: AudioFormats.getAllowedFormats()[0],
            saveTo: "",
            renameTo: "",
            startTime: 0,
            endTime: 0,
            maxVideoLength: 0,
            volumePercentage: 50,
            videoId: "",
            gettingVideo: false,
            warningDialogOpen: false,
            validationMessage: "",
            searchStatus: "pending"
        };
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
            }, async () => {
                let result = null;

                try {
                    result = await this.props.youtubeUrlParser.parse(this.state.youtubeUrl);

                    if(result && result.videoQualities && result.videoQualities.length > 0) {
                        this.setState({
                            videoQualities: result.videoQualities,
                            selectedVideoQuality: result.videoQualities[0],
                            renameTo: result.title,
                            endTime: Number(result.videoLength),
                            maxVideoLength: Number(result.videoLength),
                            videoId: result.id
                        }, () => {
                            if(this.props.settings.automaticallyDownload) {
                                this.download();
                            }
                        });
                    }
                }
                catch (e) { 
                    console.error(e);              
                }

                this.setState({
                    gettingVideo: false,
                    searchStatus: result && result.videoQualities && result.videoQualities.length > 0 ? "success" : "failed",
                    volumePercentage: 100
                });
            });       
        }
    }

    selectSaveFolder() {
        if(!this.noVideo()) {
            dialog.showOpenDialog(getCurrentWindow(), {properties: ['openDirectory']}, (folder) => {
                if(folder != undefined) {
                    this.setState({
                        saveTo: folder + "\\"
                    });
                }
            });
        }
    }

    timeChanged(values) {
        this.setState({
            startTime: values[0],
            endTime: values[1]
        });
    }

    volumeChanged(value) {
        this.setState({
            volumePercentage: value
        });
    }

    formatTime(value) {
        let minutes = Math.floor(value / 60);
        let seconds = value % 60;
        return minutes + ":" + (seconds >= 10 ? seconds : "0" + seconds);
    }

    formatVolume(value) {
        return value + "%";
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
            youtubeVideo.volumePercentage = this.state.volumePercentage;

            let settings = this.props.settings;
            settings.saveToPath = this.state.saveTo;

            this.props.dispatch({ type: RS_ADD_VIDEO, video: youtubeVideo });
            this.props.dispatch({ type: RS_APP_SETTINGS, appSettings: settings });

            this.setState({
                volumePercentage: 50
            });

            this.clearCurrentVideo(() => {
                this.props.onSwitchTab();
            });
        }
        else {
            this.setState({
                warningDialogOpen: true,
                validationMessage: validationResult.message
            });
        }
    }

    clearCurrentVideo(callback) {
        this.setState({
            selectedVideoQuality: null,
            videoQualities: [],
            renameTo: "",
            startTime: 0,
            endTime: 0,
            maxVideoLength: 0,
            videoId: "",
            searchStatus: "pending"   
        }, () => {
            if(callback) callback();
        });
    }

    noVideo() {
        return this.state.videoQualities.length === 0;
    }

    componentDidMount() {
        this.clipboardManager.callback = () => {
            if(this.props.settings.automaticallyPaste) {
                this.paste();
            }
        };

        if(this.props.lastState) {
            this.setState({
                youtubeUrl: this.props.lastState.youtubeUrl,
                videoQualities: this.props.lastState.videoQualities,
                selectedVideoQuality: this.props.lastState.selectedVideoQuality,
                selectedAudioFormat: this.props.lastState.selectedAudioFormat,
                saveTo: this.props.lastState.saveTo,
                renameTo: this.props.lastState.renameTo,
                startTime: this.props.lastState.startTime,
                endTime: this.props.lastState.endTime,
                maxVideoLength: this.props.lastState.maxVideoLength,
                volumePercentage: this.props.lastState.volumePercentage,
                videoId: this.props.lastState.videoId,
                searchStatus: this.props.lastState.searchStatus
            });
        }
    }

    componentWillUnmount() {
        this.clipboardManager.callback = null;

        this.props.dispatch({type: RS_URL_ENTRY_SAVE_STATE, screenState: {         
            youtubeUrl: this.state.youtubeUrl,
            videoQualities: this.state.videoQualities,
            selectedVideoQuality: this.state.selectedVideoQuality,
            selectedAudioFormat: this.state.selectedAudioFormat,
            saveTo: this.state.saveTo,
            renameTo: this.state.renameTo,
            startTime: this.state.startTime,
            endTime: this.state.endTime,
            maxVideoLength: this.state.maxVideoLength,
            volumePercentage: this.state.volumePercentage,
            videoId: this.state.videoId,
            searchStatus: this.state.searchStatus
        }});
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            saveTo: newProps.settings.saveToPath
        });
    }

    render() {
        const styleSheet = this.getStyles();

        return (
            <div>
                <div style={styleSheet.topSpacing}>
                    <div style={styleSheet.row}>
                        {this.state.searchStatus == "failed" ? <TextField fullWidth error placeholder="Enter the video url here and press get video"
                            value={this.state.youtubeUrl} onChange={(event) => { this.setState({ youtubeUrl: event.target.value }) }} /> :
                        <TextField fullWidth placeholder="Enter the video url here and press get video" value={this.state.youtubeUrl}
                            onChange={(event) => { this.setState({ youtubeUrl: event.target.value }) }} />}   
                    </div>
                </div>
                <div style={styleSheet.topSpacing}>
                    <Button variant="raised" size="small" color="primary" style={styleSheet.leftItem} onClick={() => {this.paste()}}>PASTE</Button>
                    <Button variant="raised" size="small" disabled={this.state.gettingVideo} color="primary" style={styleSheet.rightItem} 
                        onClick={() => {this.getVideo()}}>
                        GET VIDEO
                    </Button>
                </div>
                <div style={styleSheet.topSpacing}>
                    <LinearProgress variant={this.state.gettingVideo ? "query" : "determinate"} value={0} />
                </div>
                <div style={styleSheet.topSpacing}>
                    <div style={styleSheet.row}>
                        <Typography type="subheading" style={styleSheet.fullWidth}>Choose a video quality</Typography>
                        <Button size="small" color="primary" disabled={this.noVideo()} style={styleSheet.menuButton} onClick={(event) => {this.showVideoQualityMenu(event)}}>
                            {this.state.selectedVideoQuality != null ? this.state.selectedVideoQuality.description : "None Available"}
                        </Button>
                        <ActionMenu items={this.state.videoQualities} open={this.state.videoQualityMenuOpen} anchor={this.state.menuAnchor} selectedItem={this.state.selectedVideoQuality}
                            onClose={(index) => {this.videoQualityMenuClosed(index)}} />
                    </div>
                </div>
                <div style={styleSheet.topSpacing}>
                    <div style={styleSheet.row}>
                        <Typography type="subheading" style={styleSheet.fullWidth}>Automatically convert to</Typography>
                        <Button size="small" color="primary" disabled={this.noVideo()} style={styleSheet.menuButton} onClick={(event) => {this.showAudioTypeMenu(event)}}>
                            {this.state.selectedAudioFormat != null ? this.state.selectedAudioFormat.description : "None Available"}
                        </Button>
                        <ActionMenu items={this.state.audioFormats} open={this.state.audioTypeMenuOpen} anchor={this.state.menuAnchor} selectedItem={this.state.selectedAudioFormat}
                            onClose={(index) => {this.audioTypeMenuClosed(index)}} />
                    </div>
                </div>
                <div>
                    <div style={styleSheet.row}>
                        <TextField fullWidth disabled={this.noVideo()} label="Save to" margin="dense" value={this.state.saveTo} 
                            onClick={() => {this.selectSaveFolder()}} onChange={(event) => {this.setState({saveTo: event.target.value})}} />
                    </div>
                    <div style={styleSheet.row}>
                        <TextField fullWidth disabled={this.noVideo()} label="Rename to" margin="dense" 
                            value={this.state.renameTo} onChange={(event) => {this.setState({renameTo: event.target.value})}} />
                    </div>
                </div>
                <div style={styleSheet.topSpacing}>
                    <Typography type="subheading">Modify start / end time</Typography>
                    <Range min={0} max={this.state.maxVideoLength} value={[this.state.startTime, this.state.endTime]} style={styleSheet.slider} 
                        tipFormatter={value => this.formatTime(value)} allowCross={false} disabled={this.noVideo()} trackStyle={[styleSheet.track]}
                        railStyle={styleSheet.rail} onChange={(values) => {this.timeChanged(values)}} />
                </div>
                <div style={styleSheet.topSpacing}>
                    <Typography type="subheading">Modify volume</Typography>
                    <Slider min={50} max={200} value={this.state.volumePercentage} style={styleSheet.slider}
                        tipFormatter={value => this.formatVolume(value)} disabled={this.noVideo()} trackStyle={[styleSheet.track]}
                        railStyle={styleSheet.rail} onChange={(value) => { this.volumeChanged(value) }} />
                </div>
                <div style={styleSheet.topSpacing}>
                    <Button variant="raised" size="small" disabled={this.noVideo()} color="primary" style={styleSheet.downloadButton} 
                        onClick={() => this.download()}>DOWNLOAD</Button>
                </div>
                <WarningDialog content={this.state.validationMessage} open={this.state.warningDialogOpen} 
                    onClose={() => this.setState({warningDialogOpen: false})} />
            </div>
        );
    }

    getStyles() {
        return {
            topSpacing: {
                marginTop: 15
            },
            leftItem: {
                width: '49.5%',
                marginRight: '0.5%'
            },
            rightItem: {
                width: '49.5%',
                marginLeft: '0.5%'
            },
            row: {
                display: 'flex'
            },
            fullWidth: {
                display: 'flex',
                flexDirection: 'column',
                flex: '1 0 auto',
            },
            menuButton: {
                width: '50%',
                background: '#EDEDED'
            },
            downloadButton: {
                width: '100%',
                marginTop: 30,
                height: 40
            },
            slider: {
                marginTop: 15,
                marginLeft: 5,
                width: '99%'
            },
            track: {
                background: '#5f50e1'
            },
            rail: {
                background: '#C5B6FF'
            }
        };
    }
}

UrlEntry.propTypes = {
    youtubeUrlParser: PropTypes.object.isRequired,
    onSwitchTab: PropTypes.func.isRequired
};

UrlEntry.mapStateToProps = (state) => {
    return {
        lastState: state.UrlEntryState,
        settings: state.AppSettings
    }
}

export default connect(UrlEntry.mapStateToProps)(UrlEntry);