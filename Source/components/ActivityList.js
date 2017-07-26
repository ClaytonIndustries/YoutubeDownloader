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

export default class ActivityList extends React.Component {
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

    canNewDownloadBeStarted() {
        let activeDownloads = this.props.videos.reduce((total, item) => {
            return item.isActive() ? total + 1 : total;
        }, 0);

        let pendingDownloads = this.props.videos.some((item) => {
            return item.isPending();
        });

        return activeDownloads < 2 && pendingDownloads > 0;
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
                    <Button dense color="primary">
                        <RemoveIcon />
                    </Button>
                    <Button dense color="primary">
                        <FolderIcon />
                    </Button>
                    <Button dense color="primary">
                        <PlayIcon />
                    </Button>
                    <Button dense color="primary">
                        <RetryIcon />
                    </Button>
                </div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Size (MB/s)</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.videos.map((item, index) => {
                            return (
                                <VideoRow key={index} title={item.title} size={item.size} progress={item.progress} status={item.status} />
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

ActivityList.propTypes = {
    videos: PropTypes.array.isRequired
};