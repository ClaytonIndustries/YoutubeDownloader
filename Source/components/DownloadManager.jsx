import React from 'react';
import { connect } from 'react-redux';

import { queuedVideoCount } from '../actions';

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

        if (activeDownloads + pendingDownloads !== this.props.queuedVideoCount) {
            this.props.queuedVideoCount(activeDownloads + pendingDownloads);
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
        videos: state.videos,
        queuedVideoCount: state.queuedVideoCount
    }
}

const mapDispatchToProps = {
    queuedVideoCount
}

export default connect(DownloadManager.mapStateToProps, mapDispatchToProps)(DownloadManager);