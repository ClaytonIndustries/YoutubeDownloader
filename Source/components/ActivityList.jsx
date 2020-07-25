import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';

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

const useStyles = makeStyles(() => ({
    row: {
        display: 'flex',
        justifyContent: 'center'
    }
}));

const ActivityList = () => {
    const classes = useStyles();

    const [selectedIndex, setSelectedIndex] = useState(-1);

    const videos = useSelector((state) => state.videos);

    const dispatch = useDispatch();

    const getSelectedVideoFromIndex = () => {
        if (selectedIndex >= 0 && selectedIndex < videos.length) {
            return videos[selectedIndex];
        }

        return undefined;
    };

    const removeSelectedVideo = () => {
        const video = getSelectedVideoFromIndex();

        if (video) {
            if (video.isActive()) {
                video.cancel();
            }
            dispatch(removeVideo(selectedIndex));
            setSelectedIndex(-1);
        }
    };

    const openMediaFileLocation = () => {
        const video = getSelectedVideoFromIndex();

        if (video) {
            openItem(video.destinationFolder);
        }
    };

    const playMedia = () => {
        const video = getSelectedVideoFromIndex();

        if (video && video.isComplete()) {
            if (video.shouldConvertAudio()) {
                openItem(video.destinationAudioPath());
            } else {
                openItem(video.destinationVideoPath());
            }
        }
    };

    const retryDownload = () => {
        const video = getSelectedVideoFromIndex();

        if (video && video.hasFailed()) {
            video.resetStatus();
        }
    };

    const videoClicked = (id) => setSelectedIndex(id === selectedIndex ? -1 : id);

    const tooltipEnterDelayInMilliseconds = 400;

    return (
        <div>
            <div className={classes.row}>
                <Tooltip title="Cancel / Remove" placement="bottom" enterDelay={tooltipEnterDelayInMilliseconds}>
                    <Button size="small" color="primary" onClick={removeSelectedVideo}>
                        <RemoveIcon />
                    </Button>
                </Tooltip>
                <Tooltip title="Open File Location" placement="bottom" enterDelay={tooltipEnterDelayInMilliseconds}>
                    <Button size="small" color="primary" onClick={openMediaFileLocation}>
                        <FolderIcon />
                    </Button>
                </Tooltip>
                <Tooltip title="Play" placement="bottom" enterDelay={tooltipEnterDelayInMilliseconds}>
                    <Button size="small" color="primary" onClick={playMedia}>
                        <PlayIcon />
                    </Button>
                </Tooltip>
                <Tooltip title="Retry Download" placement="bottom" enterDelay={tooltipEnterDelayInMilliseconds}>
                    <Button size="small" color="primary" onClick={retryDownload}>
                        <RetryIcon />
                    </Button>
                </Tooltip>
            </div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell>Title</TableCell>
                        <TableCell>Size (MB/s)</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {videos.map((item, index) => (
                        <VideoRow key={item.videoId} id={index} video={item} isSelected={index === selectedIndex} onSelected={(id) => videoClicked(id)} />))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ActivityList;