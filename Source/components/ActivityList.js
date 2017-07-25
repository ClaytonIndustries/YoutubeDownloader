import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { LinearProgress } from 'material-ui/Progress';

import RemoveIcon from 'material-ui-icons/Delete';
import FolderIcon from 'material-ui-icons/Folder';
import PlayIcon from 'material-ui-icons/PlayArrow';
import RetryIcon from 'material-ui-icons/Refresh';

export default class ActivityList extends React.Component {
    constructor(props) {
        super(props);
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
                                <TableRow hover key={index}>
                                    <TableCell>
                                        {item.title}
                                    </TableCell>
                                    <TableCell>
                                        {item.size}
                                    </TableCell>
                                    <TableCell>
                                        <LinearProgress mode="determinate" value={item.progress} />
                                    </TableCell>
                                    <TableCell>
                                        {item.status}
                                    </TableCell>
                            </TableRow>
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