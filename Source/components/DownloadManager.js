import React from 'react';
import { connect } from 'react-redux';

import { RS_QUEUED_VIDEOS } from '../models/Constants';

class DownloadManager extends React.Component {
    constructor(props) {
        super(props);
    }

    startNewDownload() {
        if(this.canNewDownloadBeStarted()) {
            let video = this.props.videos.find((item) => {
                return item.isPending();
            });

            video.start();
        }
    }

    cancelStalledDownloads() {
        this.props.videos.forEach((item) => {
            if(item.noContentDownloadedInLastTenSeconds()) {
                item.cancel();
            }
        });
    }

    canNewDownloadBeStarted() {
        const maxActiveDownloads = 2;

        let activeDownloads = this.props.videos.reduce((total, item) => {
            return item.isActive() ? total + 1 : total;
        }, 0);

        let pendingDownloads = this.props.videos.reduce((total, item) => {
            return item.isPending() ? total + 1 : total;
        }, 0);

        if (activeDownloads + pendingDownloads !== this.props.queuedVideos) {
            this.props.dispatch({ type: RS_QUEUED_VIDEOS, queuedVideos: activeDownloads + pendingDownloads });
        }

        return activeDownloads < maxActiveDownloads && pendingDownloads > 0;
    }

    componentDidMount() {
        this.timer = setInterval(() => {this.cancelStalledDownloads(); this.startNewDownload();}, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        return null;
    }
}

DownloadManager.mapStateToProps = (state) => {
    return {
        videos: state.Videos,
        queuedVideos: state.QueuedVideos
    }
}

export default connect(DownloadManager.mapStateToProps)(DownloadManager);