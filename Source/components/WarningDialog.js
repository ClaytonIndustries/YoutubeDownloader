import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default class WarningDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Dialog open={this.props.open} onClose={() => {this.props.onClose()}}>
                <DialogTitle>
                    Warning, please correct the following issue
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {this.props.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {this.props.onClose()}} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

WarningDialog.propTypes = {
    content: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};