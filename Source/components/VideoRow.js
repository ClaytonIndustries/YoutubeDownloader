import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import LinearProgress from '@material-ui/core/LinearProgress';
import Checkbox from '@material-ui/core/Checkbox';

export default class VideoRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.video.title,
            status: this.props.video.status,
            progress: this.props.video.progress,
            size: this.props.video.sizeInMBs
        };
    }

    componentDidMount() {
        this.props.video.changed = () => {
            this.setState({
                status: this.props.video.status,
                progress: this.props.video.progress,
                size: this.props.video.sizeInMBs
            });
        };
    }

    componentWillUnmount() {
        this.props.video.changed = null;
    }

    render() {
        return (
            <TableRow hover selected={this.props.isSelected} onClick={() => this.props.onSelected(this.props.id)}>
                <TableCell padding="checkbox">
                    <Checkbox color="primary" checked={this.props.isSelected} />
                </TableCell>
                <TableCell padding="dense">
                    {this.state.title}
                </TableCell>
                <TableCell padding="dense">
                    {this.state.size === 0 ? "" : this.state.size}
                </TableCell>
                <TableCell padding="dense">
                    <LinearProgress variant="determinate" value={this.state.progress} />
                </TableCell>
                <TableCell padding="dense">
                    {this.state.status}
                </TableCell>
            </TableRow>
        );
    }
}

VideoRow.propTypes = {
    video: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onSelected: PropTypes.func.isRequired
};