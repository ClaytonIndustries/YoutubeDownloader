import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';

import SliderBase from 'rc-slider';

import ActionMenu from './ActionMenu';
import WarningDialog from './WarningDialog';

import audioFormats from '../models/audioFormats';
import validateProperties from '../models/VideoValidator';
import YoutubeVideo from '../models/YoutubeVideo';
import { readText, isYoutubeUrl } from '../models/ClipboardManager';
import { VS_PENDING } from '../models/Constants';
import { addVideo, appSettings, urlEntryState } from '../actions';

const { dialog, getCurrentWindow } = window.require('electron').remote;

const { createSliderWithTooltip } = SliderBase;
const Slider = createSliderWithTooltip(SliderBase);
const Range = createSliderWithTooltip(SliderBase.Range);

class UrlEntry extends React.Component {
    constructor(props) {
        super(props);

        this.clipboardInterval = null;

        this.state = {
            youtubeUrl: '',
            videoQualities: [],
            audioFormats,
            videoQualityMenuOpen: false,
            audioTypeMenuOpen: false,
            menuAnchor: null,
            selectedVideoQuality: null,
            selectedAudioFormat: audioFormats[0],
            saveTo: this.props.settings.saveToPath,
            renameTo: '',
            startTime: 0,
            endTime: 0,
            maxVideoLength: 0,
            volumePercentage: 50,
            videoId: '',
            gettingVideo: false,
            warningDialogOpen: false,
            validationMessage: '',
            searchFailed: false,
            snackbarOpen: false
        };
    }

    showVideoQualityMenu(event) {
        if (this.state.videoQualities.length > 0) {
            this.setState({
                videoQualityMenuOpen: true,
                menuAnchor: event.currentTarget
            });
        }
    }

    showAudioTypeMenu(event) {
        if (this.state.audioFormats.length > 0) {
            this.setState({
                audioTypeMenuOpen: true,
                menuAnchor: event.currentTarget
            });
        }
    }

    videoQualityMenuClosed(index) {
        this.setState({
            videoQualityMenuOpen: false,
            selectedVideoQuality: index !== undefined ? this.state.videoQualities[index] : this.state.selectedVideoQuality
        });
    }

    audioTypeMenuClosed(index) {
        this.setState({
            audioTypeMenuOpen: false,
            selectedAudioFormat: index !== undefined ? this.state.audioFormats[index] : this.state.selectedAudioFormat
        });
    }

    paste() {
        this.setState({
            youtubeUrl: readText()
        }, () => {
            if (this.props.settings.automaticallyGetVideo) {
                this.getVideo();
            }
        });
    }

    getVideo() {
        if (!this.state.gettingVideo) {
            this.clearCurrentVideo();
            this.setState({
                gettingVideo: true
            }, async () => {
                let result = null;

                try {
                    result = await this.props.youtubeUrlParser.parse(this.state.youtubeUrl);

                    if (result && result.videoQualities && result.videoQualities.length > 0) {
                        this.setState({
                            videoQualities: result.videoQualities,
                            selectedVideoQuality: result.videoQualities[0],
                            renameTo: result.title,
                            endTime: Number(result.videoLength),
                            maxVideoLength: Number(result.videoLength),
                            videoId: result.id,
                            volumePercentage: 100
                        }, () => {
                            if (this.props.settings.automaticallyDownload) {
                                this.download();
                            }
                        });
                    }
                } catch (e) {
                    console.error(e);
                }

                this.setState({
                    gettingVideo: false,
                    searchFailed: !result || !result.videoQualities || !result.videoQualities.length
                });
            });
        }
    }

    selectSaveFolder() {
        if (!this.noVideo()) {
            dialog.showOpenDialog(getCurrentWindow(), {
                properties: ['openDirectory']
            }).then(result => {
                if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
                    this.setState({
                        saveTo: `${result.filePaths[0]}\\`
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
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        const formattedSeconds = seconds >= 10 ? seconds : `0${seconds}`;
        return `${minutes}:${formattedSeconds}`;
    }

    formatVolume(value) {
        return `${value}%`;
    }

    download() {
        let validationResult = validateProperties(this.state.selectedVideoQuality, this.state.saveTo, this.state.renameTo, this.state.startTime, this.state.endTime);

        if (validationResult.isValid) {
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

            this.props.addVideo(youtubeVideo);
            this.props.appSettings(settings);

            this.setState({ snackbarOpen: true });

            this.clearCurrentVideo();
        } else {
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
            renameTo: '',
            startTime: 0,
            endTime: 0,
            maxVideoLength: 1,
            videoId: '',
            searchFailed: false,
            volumePercentage: 50
        });
    }

    noVideo() {
        return this.state.videoQualities.length === 0;
    }

    componentDidMount() {
        this.clipboardInterval = setInterval(() => {
            const newText = readText();
            if (newText !== this.state.youtubeUrl && isYoutubeUrl(newText)) {
                if (this.props.settings.automaticallyPaste) {
                    this.paste();
                }
            }
        }, 500);

        if (this.props.lastState) {
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
                searchFailed: this.props.lastState.searchFailed
            });
        }
    }

    componentWillUnmount() {
        clearInterval(this.clipboardInterval);

        this.props.urlEntryState({
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
            searchFailed: this.state.searchFailed
        });
    }

    render() {
        const { classes } = this.props;

        const rcSliderStyles = {
            track: {
                background: '#5f50e1'
            },
            rail: {
                background: '#C5B6FF'
            },
            handle: {
                borderColor: this.noVideo() ? '#C5B6FF' : '#5f50e1',
                boxShadow: 'none'
            }
        };

        return (
            <div>
                <div className={classes.topSpacing}>
                    <div className={classes.row}>
                        <TextField fullWidth error={this.state.searchFailed} placeholder="Enter the video url here and press get video"
                                value={this.state.youtubeUrl} onChange={(event) => { this.setState({ youtubeUrl: event.target.value }) }} />
                    </div>
                </div>
                <div className={classes.topSpacing}>
                    <Button variant="contained" size="medium" color="primary" className={classes.leftItem} onClick={() => {this.paste()}}>PASTE</Button>
                    <Button variant="contained" size="medium" disabled={this.state.gettingVideo} color="primary" className={classes.rightItem} 
                        onClick={() => {this.getVideo()}}>
                        GET VIDEO
                    </Button>
                </div>
                <div className={classes.topSpacing}>
                    <LinearProgress variant={this.state.gettingVideo ? "query" : "determinate"} value={0} />
                </div>
                <div className={classes.topSpacing}>
                    <div className={classes.row}>
                        <Typography type="subheading" className={classes.fullWidth}>Choose a video quality</Typography>
                        <Button size="small" color="primary" disabled={this.noVideo()} className={classes.menuButton} onClick={(event) => {this.showVideoQualityMenu(event)}}>
                            {this.state.selectedVideoQuality != null ? this.state.selectedVideoQuality.description : "None Available"}
                        </Button>
                        <ActionMenu items={this.state.videoQualities} open={this.state.videoQualityMenuOpen} anchor={this.state.menuAnchor} selectedItem={this.state.selectedVideoQuality}
                            onClose={(index) => {this.videoQualityMenuClosed(index)}} />
                    </div>
                </div>
                <div className={classes.topSpacing}>
                    <div className={classes.row}>
                        <Typography type="subheading" className={classes.fullWidth}>Automatically convert to</Typography>
                        <Button size="small" color="primary" disabled={this.noVideo()} className={classes.menuButton} onClick={(event) => {this.showAudioTypeMenu(event)}}>
                            {this.state.selectedAudioFormat != null ? this.state.selectedAudioFormat.description : "None Available"}
                        </Button>
                        <ActionMenu items={this.state.audioFormats} open={this.state.audioTypeMenuOpen} anchor={this.state.menuAnchor} selectedItem={this.state.selectedAudioFormat}
                            onClose={(index) => {this.audioTypeMenuClosed(index)}} />
                    </div>
                </div>
                <div>
                    <div className={classes.row}>
                        <TextField fullWidth disabled={this.noVideo()} label="Save to" margin="dense" value={this.state.saveTo} 
                            onClick={() => {this.selectSaveFolder()}} onChange={(event) => {this.setState({saveTo: event.target.value})}} />
                    </div>
                    <div className={classes.row}>
                        <TextField fullWidth disabled={this.noVideo()} label="Rename to" margin="dense" 
                            value={this.state.renameTo} onChange={(event) => {this.setState({renameTo: event.target.value})}} />
                    </div>
                </div>
                <div className={classes.topSpacing}>
                    <Typography type="subheading">Modify start / end time</Typography>
                    <Range min={0} max={this.state.maxVideoLength} value={[this.state.startTime, this.state.endTime]} className={classes.slider} 
                        tipFormatter={value => this.formatTime(value)} allowCross={false} disabled={this.noVideo()} trackStyle={[rcSliderStyles.track]}
                        railStyle={rcSliderStyles.rail} handleStyle={rcSliderStyles.handle} onChange={(values) => {this.timeChanged(values)}} />
                </div>
                <div className={classes.topSpacing}>
                    <Typography type="subheading">Modify volume</Typography>
                    <Slider min={50} max={200} value={this.state.volumePercentage} className={classes.slider}
                        tipFormatter={value => this.formatVolume(value)} disabled={this.noVideo()} trackStyle={[rcSliderStyles.track]}
                        railStyle={rcSliderStyles.rail} handleStyle={rcSliderStyles.handle} onChange={(value) => { this.volumeChanged(value) }} />
                </div>
                <div className={classes.topSpacing}>
                    <Button variant="contained" size="small" disabled={this.noVideo()} color="primary" className={classes.downloadButton} 
                        onClick={() => this.download()}>DOWNLOAD</Button>
                </div>
                <WarningDialog content={this.state.validationMessage} open={this.state.warningDialogOpen} 
                    onClose={() => this.setState({ warningDialogOpen: false })} />
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    autoHideDuration={3000}
                    open={this.state.snackbarOpen}
                    onClose={() => this.setState({snackbarOpen: false})}
                    message={'Download queued'} />
            </div>
        );
    }
}

const styles = () => ({
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
    }
});

UrlEntry.propTypes = {
    youtubeUrlParser: PropTypes.object.isRequired
};

UrlEntry.mapStateToProps = (state) => {
    return {
        lastState: state.urlEntryState,
        settings: state.appSettings
    }
}

const mapDispatchToProps = {
    addVideo, 
    appSettings, 
    urlEntryState
}

export default connect(UrlEntry.mapStateToProps, mapDispatchToProps)(withStyles(styles)(UrlEntry));