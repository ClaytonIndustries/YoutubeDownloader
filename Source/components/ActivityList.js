import React from 'react';
import ReactDOM from 'react-dom';

import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

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
                    <Button color="primary">
                        <RemoveIcon />
                    </Button>
                    <Button color="primary">
                        <FolderIcon />
                    </Button>
                    <Button color="primary">
                        <PlayIcon />
                    </Button>
                    <Button color="primary">
                        <RetryIcon />
                    </Button>
                </div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell numeric>Size (MB/s)</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    </TableBody>
                </Table>
            </div>
        );
    }
}