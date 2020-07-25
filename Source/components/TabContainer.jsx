import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@material-ui/core/Badge';

import SearchIcon from '@material-ui/icons/Search';
import DownloadIcon from '@material-ui/icons/GetApp';

import UrlEntry from './UrlEntry';
import ActivityList from './ActivityList';

import YoutubeUrlParser from '../models/YoutubeUrlParser';

const useStyles = makeStyles(() => ({
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
}));

const TabContainer = () => {
    const classes = useStyles();

    const [state, setState] = useState({
        selectedTabIndex: 0,
        youtubeUrlParser: new YoutubeUrlParser()
    });

    const queuedVideoCount = useSelector((s) => s.queuedVideoCount);

    const handleTabChange = (event, index) => {
        setState({
            ...state,
            selectedTabIndex: index
        });
    };

    return (
        <div className={classes.tabContainer}>
            <AppBar position="static">
                <Tabs variant="fullWidth" centered value={state.selectedTabIndex} onChange={handleTabChange}>
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

export default TabContainer;