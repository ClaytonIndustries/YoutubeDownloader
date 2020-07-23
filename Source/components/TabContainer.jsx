import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@material-ui/core/Badge';

import SearchIcon from '@material-ui/icons/Search';
import DownloadIcon from '@material-ui/icons/GetApp';

import UrlEntry from './UrlEntry';
import ActivityList from './ActivityList';

import YoutubeUrlParser from '../models/YoutubeUrlParser';

const TabContainer = (props) => {
    const { queuedVideoCount, classes } = props;

    const [state, setState] = useState({
        selectedTabIndex: 0,
        youtubeUrlParser: new YoutubeUrlParser()
    });

    const handleTabChange = (index) => {
        setState({
            ...state,
            selectedTabIndex: index
        });
    };

    return (
        <div className={classes.tabContainer}>
            <AppBar position="static">
                <Tabs variant="fullWidth" centered value={state.selectedTabIndex} onChange={(event, index) => { handleTabChange(index); }}>
                    <Tab icon={<SearchIcon />} />
                    <Tab label={
                        <Badge className={classes.badge} color="secondary" badgeContent={queuedVideoCount}>
                            <DownloadIcon />
                        </Badge>
                    } />
                </Tabs>
            </AppBar>
            <div className={classes.childContainer}>
                {state.selectedTabIndex === 0 && <UrlEntry youtubeUrlParser={state.youtubeUrlParser} />}
                {state.selectedTabIndex === 1 && <ActivityList />}
            </div>
        </div>
    );
};

TabContainer.propTypes = {
    queuedVideoCount: PropTypes.number.isRequired,
};

const styles = () => ({
    tabContainer: {
        marginTop: 10
    },
    childContainer: {
        marginLeft: 5,
        marginRight: 5,
        marginTop: 15,
        marginBottom: 5
    },
    badge: {
        paddingRight: 8
    }
});

TabContainer.mapStateToProps = (state) => ({ queuedVideoCount: state.queuedVideoCount });

export default connect(TabContainer.mapStateToProps)(withStyles(styles)(TabContainer));