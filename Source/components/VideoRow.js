import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { LinearProgress } from 'material-ui/Progress';

export default class VideoRow extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TableRow hover>
                <TableCell>
                    {this.props.title}
                </TableCell>
                <TableCell>
                    {this.props.size}
                </TableCell>
                <TableCell>
                    <LinearProgress mode="determinate" value={this.props.progress} />
                </TableCell>
                <TableCell>
                    {this.props.status}
                </TableCell>
            </TableRow>
        );
    }
}

VideoRow.propTypes = {
    title: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    progress: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
};