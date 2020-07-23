import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import LinearProgress from '@material-ui/core/LinearProgress';
import Checkbox from '@material-ui/core/Checkbox';

import YoutubeVideo from '../models/YoutubeVideo';

const VideoRow = (props) => {
    const {
        id, video, isSelected, onSelected
    } = props;

    const [state, setState] = useState({
        title: video.title,
        status: video.status,
        progress: video.progress,
        size: video.sizeInMBs
    });

    useEffect(() => {
        video.changed = () => {
            setState({
                ...state,
                status: video.status,
                progress: video.progress,
                size: video.sizeInMBs
            });
        };

        return () => { video.changed = null; };
    }, []);

    return (
        <TableRow hover selected={isSelected} onClick={() => onSelected(id)}>
            <TableCell padding="checkbox">
                <Checkbox color="primary" checked={isSelected} />
            </TableCell>
            <TableCell>
                { state.title }
            </TableCell>
            <TableCell>
                { state.size === 0 ? '' : state.size }
            </TableCell>
            <TableCell>
                <LinearProgress variant="determinate" value={state.progress} />
            </TableCell>
            <TableCell>
                { state.status }
            </TableCell>
        </TableRow>
    );
};

VideoRow.propTypes = {
    id: PropTypes.number.isRequired,
    video: PropTypes.instanceOf(YoutubeVideo).isRequired,
    isSelected: PropTypes.bool.isRequired,
    onSelected: PropTypes.func.isRequired
};

export default VideoRow;