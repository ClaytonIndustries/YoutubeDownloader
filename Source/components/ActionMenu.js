import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Menu, { MenuItem } from 'material-ui/Menu';

export default class ActionMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    onMenuAction(index) {
        this.props.onClose(index);
    }

    render() {
        return (
            <Menu aria-haspopup="true" anchorEl={this.props.anchor} open={this.props.open} onRequestClose={() => {this.onMenuAction()}}>
                {this.props.items.map((item, index) => {
                    return (
                        <MenuItem key={index} selected={item === this.props.selectedItem} onClick={() => {this.onMenuAction(index)}}>{item.description}</MenuItem>
                    );
                })}          
            </Menu>
        );
    }
}

ActionMenu.propTypes = {
    items: PropTypes.array.isRequired,
    open: PropTypes.bool.isRequired,
    anchor: PropTypes.object,
    selectedItem: PropTypes.object,
    onClose: PropTypes.func.isRequired
};