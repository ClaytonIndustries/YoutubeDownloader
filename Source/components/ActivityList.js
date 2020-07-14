import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Tooltip from '@material-ui/core/Tooltip';

import RemoveIcon from '@material-ui/icons/Delete';
import FolderIcon from '@material-ui/icons/Folder';
import PlayIcon from '@material-ui/icons/PlayArrow';
import RetryIcon from '@material-ui/icons/Refresh';

import VideoRow from './VideoRow';

import { openItem } from '../models/ProcessStarter';
import { removeVideo } from '../actions';

class ActivityList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: -1
        };
    }

    removeVideo() {
        let video = this.getSelectedVideoFromIndex();

        if(video) {
            if(video.isActive()) {
                video.cancel();
            }
            this.props.dispatch(removeVideo(this.state.selectedIndex));
            this.setState({
                selectedIndex: -1
            });
        }
    }

    openMediaFileLocation() {
        let video = this.getSelectedVideoFromIndex();

        if(video) {
            openItem(video.destinationFolder);
        }
    }

    playMedia() {
        let video = this.getSelectedVideoFromIndex();
        
        if(video && video.isComplete()) {
            if(video.shouldConvertAudio()) {
                openItem(video.destinationAudioPath());
            }
            else {
                openItem(video.destinationVideoPath());
            }
        }
    }

    retryDownload() {
        let video = this.getSelectedVideoFromIndex();

        if(video && video.hasFailed()) {
            video.resetStatus();
        }
    }

    getSelectedVideoFromIndex() {
        if(this.state.selectedIndex >= 0 && this.state.selectedIndex < this.props.videos.length) {
            return this.props.videos[this.state.selectedIndex];
        }

        return undefined;
    }

    videoClicked(id) {
        this.setState({
           selectedIndex: id === this.state.selectedIndex ? -1 : id
        });
    }

    render() {
        const { classes } = this.props;

        const tooltipEnterDelayInMilliseconds = 400;

        return (
            <div>
                <div className={classes.row}>
                    <Tooltip title="Cancel / Remove" placement="bottom" enterDelay={tooltipEnterDelayInMilliseconds}>
                        <Button size="small" color="primary" onClick={() => this.removeVideo()}>
                            <RemoveIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Open File Location" placement="bottom" enterDelay={tooltipEnterDelayInMilliseconds}>
                        <Button size="small" color="primary" onClick={() => this.openMediaFileLocation()}>
                            <FolderIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Play" placement="bottom" enterDelay={tooltipEnterDelayInMilliseconds}>
                        <Button size="small" color="primary" onClick={() => this.playMedia()}>
                            <PlayIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Retry Download" placement="bottom" enterDelay={tooltipEnterDelayInMilliseconds}>
                        <Button size="small" color="primary" onClick={() => this.retryDownload()}>
                            <RetryIcon />
                        </Button>
                    </Tooltip>
                </div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox"></TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Size (MB/s)</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.videos.map((item, index) => {
                            return (
                                <VideoRow key={item.videoId} id={index} video={item} isSelected={index === this.state.selectedIndex} 
                                    onSelected={(id) => this.videoClicked(id)} />
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

const styles = theme => ({
    row: {
        display: 'flex',
        justifyContent: 'center'
    }
});

ActivityList.mapStateToProps = (state) => {
    return {
        videos: state.videos
    }
}

export default connect(ActivityList.mapStateToProps)(withStyles(styles)(ActivityList));