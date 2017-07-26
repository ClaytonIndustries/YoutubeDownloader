import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { TableCell, TableRow } from 'material-ui/Table';
import { LinearProgress } from 'material-ui/Progress';
import Checkbox from 'material-ui/Checkbox';

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
                <TableCell checkbox>
                    <Checkbox checked={this.props.isSelected} />
                </TableCell>
                <TableCell>
                    {this.state.title}
                </TableCell>
                <TableCell>
                    {this.state.size}
                </TableCell>
                <TableCell>
                    <LinearProgress mode="determinate" value={this.state.progress} />
                </TableCell>
                <TableCell>
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