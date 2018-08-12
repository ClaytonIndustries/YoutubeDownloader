import React from 'react';
import PropTypes from 'prop-types';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

export default class ActionMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    onMenuAction(index) {
        this.props.onClose(index);
    }

    render() {
        return (
            <Menu anchorEl={this.props.anchor} open={this.props.open} onClose={() => {this.onMenuAction()}}>
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