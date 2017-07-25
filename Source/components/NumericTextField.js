import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import TextField from 'material-ui/TextField';

export default class NumericTextField extends React.Component {
    constructor(props) {
        super(props);
    }

    validateEntry(event) {
        let isNum = new RegExp("^[0-9]*$").test(event.target.value);
        if(isNum) {
            this.props.onChange(event.target.value);
        }
        else {
            this.props.onChange(event.target.value.replace(/[^0-9]/, ""));
        }
    }

    render() {
        return (
            <TextField margin="dense" label={this.props.label} style={this.props.style} value={this.props.value} 
                onChange={(event) => {this.validateEntry(event)}} />
        );
    }
}

NumericTextField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    style: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
};