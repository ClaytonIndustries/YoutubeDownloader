import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Badge from '@material-ui/core/Badge';

import SearchIcon from '@material-ui/icons/Search';
import DownloadIcon from '@material-ui/icons/GetApp';

import UrlEntry from './UrlEntry';
import ActivityList from './ActivityList';

import YoutubeUrlParser from '../models/YoutubeUrlParser';

class TabContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTabIndex: 0
        };
        this.youtubeUrlParser = new YoutubeUrlParser();
    }

    handleTabChange(index) {
        this.setState({ 
            selectedTabIndex: index
        });
    };

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.tabContainer}>
                <AppBar position="static">
                    <Tabs variant="fullWidth" centered value={this.state.selectedTabIndex} onChange={(event, index) => {this.handleTabChange(index)}}>
                        <Tab icon={<SearchIcon />} />
                        <Tab label={
                            <Badge className={classes.badge} color="secondary" badgeContent={this.props.queuedVideoCount}>
                                <DownloadIcon />
                            </Badge>} />
                    </Tabs>
                </AppBar>
                <div className={classes.childContainer}>
                    {this.state.selectedTabIndex == 0 && <UrlEntry youtubeUrlParser={this.youtubeUrlParser} />}
                    {this.state.selectedTabIndex == 1 && <ActivityList />}
                </div>
          </div>
        );
    }
}

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

TabContainer.mapStateToProps = (state) => {
    return {
        queuedVideoCount: state.queuedVideoCount
    }
}

export default connect(TabContainer.mapStateToProps)(withStyles(styles)(TabContainer));