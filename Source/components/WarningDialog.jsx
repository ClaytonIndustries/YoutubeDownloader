import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const WarningDialog = (props) => {
    const { open, onClose, content } = props;

    return (
        <Dialog open={open} onClose={() => { onClose(); }}>
            <DialogTitle>
                Warning, please correct the following issue
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    { content }
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { onClose(); }} color="primary">
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
};

WarningDialog.propTypes = {
    content: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default WarningDialog;