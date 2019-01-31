import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

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

    handleTabChange(event, index) {
        this.setState({ 
            selectedTabIndex: index
        });
    };

    switchToActivityTab() {
        this.setState({
            selectedTabIndex: 1
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.tabContainer}>
                <AppBar position="static">
                    <Tabs fullWidth centered value={this.state.selectedTabIndex} onChange={(event, index) => {this.handleTabChange(event, index)}}>
                        <Tab icon={<SearchIcon />} />
                        <Tab icon={<DownloadIcon />} />
                    </Tabs>
                </AppBar>
                <div className={classes.childContainer}>
                    {this.state.selectedTabIndex == 0 &&
                        <UrlEntry youtubeUrlParser={this.youtubeUrlParser} onSwitchTab={() => {this.switchToActivityTab()}} />
                    }
                    {this.state.selectedTabIndex == 1 &&
                        <ActivityList />
                    }
                </div>
          </div>
        );
    }
}

const styles = theme => ({
    tabContainer: {
        marginTop: 10
    },
    childContainer: {
        marginLeft: 5,
        marginRight: 5,
        marginTop: 15,
        marginBottom: 5
    }
});

export default withStyles(styles)(TabContainer);