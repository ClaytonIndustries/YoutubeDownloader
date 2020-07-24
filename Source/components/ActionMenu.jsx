import React from 'react';
import PropTypes from 'prop-types';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const ActionMenu = (props) => {
    const {
        items, open, anchor, selectedItem, onClose
    } = props;

    const onMenuAction = (index) => onClose(index);

    return (
        <Menu anchorEl={anchor} open={open} onClose={onMenuAction}>
            {items.map((item, index) => (
                <MenuItem key={index} selected={item === selectedItem} onClick={() => onMenuAction(index)}>{item.description}</MenuItem>
            ))}
        </Menu>
    );
};

ActionMenu.propTypes = {
    items: PropTypes.array.isRequired,
    open: PropTypes.bool.isRequired,
    anchor: PropTypes.object,
    selectedItem: PropTypes.object,
    onClose: PropTypes.func.isRequired
};

ActionMenu.defaultProps = {
    anchor: null,
    selectedItem: null
};

export default ActionMenu;