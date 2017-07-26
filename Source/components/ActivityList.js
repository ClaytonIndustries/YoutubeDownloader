import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import RemoveIcon from 'material-ui-icons/Delete';
import FolderIcon from 'material-ui-icons/Folder';
import PlayIcon from 'material-ui-icons/PlayArrow';
import RetryIcon from 'material-ui-icons/Refresh';

import VideoRow from './VideoRow';

import ProcessStarter from '../util/ProcessStarter';

export default class ActivityList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: -1
        };

        this.processStarter = new ProcessStarter();
    }

    startNewDownload() {
        if(this.canNewDownloadBeStarted()) {
            let video = this.props.videos.find((item) => {
                return item.isPending();
            });

            video.start();
        }
    }

    canNewDownloadBeStarted() {
        let activeDownloads = this.props.videos.reduce((total, item) => {
            return item.isActive() ? total + 1 : total;
        }, 0);

        let pendingDownloads = this.props.videos.some((item) => {
            return item.isPending();
        });

        return activeDownloads < 2 && pendingDownloads > 0;
    }

    removeVideo() {
        let video = this.getSelectedVideoFromIndex();

        if(video) {
            if(video.isActive()) {
                video.cancel();
            }
            this.props.onRemoveVideo(this.state.selectedIndex);
            this.setState({
                selectedIndex: -1
            });
        }
    }

    openMediaFileLocation() {
        let video = this.getSelectedVideoFromIndex();

        if(video) {
            this.processStarter.openItem(video.destinationFolder);
        }
    }

    playMedia() {
        let video = this.getSelectedVideoFromIndex();
        
        if(video && video.isComplete()) {
            if(video.shouldConvertAudio()) {
                this.processStarter.openItem(video.destinationAudioPath());
            }
            else {
                this.processStarter.openItem(video.destinationVideoPath());
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

    componentDidMount() {
        this.timer = setInterval(() => this.startNewDownload(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const rowStyle = {
            display: 'flex',
            justifyContent: 'center'
        };

        return (
            <div>
                <div style={rowStyle}>
                    <Button dense color="primary" onClick={() => this.removeVideo()}>
                        <RemoveIcon />
                    </Button>
                    <Button dense color="primary" onClick={() => this.openMediaFileLocation()}>
                        <FolderIcon />
                    </Button>
                    <Button dense color="primary" onClick={() => this.playMedia()}>
                        <PlayIcon />
                    </Button>
                    <Button dense color="primary" onClick={() => this.retryDownload()}>
                        <RetryIcon />
                    </Button>
                </div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell compact disablePadding></TableCell>
                            <TableCell compact disablePadding>Title</TableCell>
                            <TableCell compact disablePadding>Size (MB/s)</TableCell>
                            <TableCell compact disablePadding>Progress</TableCell>
                            <TableCell compact disablePadding>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.videos.map((item, index) => {
                            return (
                                <VideoRow key={index} id={index} video={item} isSelected={index === this.state.selectedIndex} 
                                    onSelected={(id) => this.videoClicked(id)} />
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

ActivityList.propTypes = {
    videos: PropTypes.array.isRequired,
    onRemoveVideo: PropTypes.func.isRequired
};