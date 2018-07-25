import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import SearchIcon from '@material-ui/icons/Search';
import DownloadIcon from '@material-ui/icons/GetApp';

import UrlEntry from './UrlEntry';
import ActivityList from './ActivityList';

import YoutubeUrlParser from '../models/YoutubeUrlParser';

export default class TabContainer extends React.Component {
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
        const styleSheet = this.getStyles();

        return (
            <div style={styleSheet.tabContainer}>
                <AppBar position="static">
                    <Tabs fullWidth centered value={this.state.selectedTabIndex} onChange={(event, index) => {this.handleTabChange(event, index)}}>
                        <Tab icon={<SearchIcon />} />
                        <Tab icon={<DownloadIcon />} />
                    </Tabs>
                </AppBar>
                <div style={styleSheet.childContainer}>
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

    getStyles() {
        return {
            tabContainer: {
                marginTop: 10
            },
            childContainer: {
                marginLeft: 5,
                marginRight: 5,
                marginTop: 15,
                marginBottom: 5
            }
        };
    }
}