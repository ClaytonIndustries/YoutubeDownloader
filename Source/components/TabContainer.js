import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import UrlEntry from './UrlEntry';
import ActivityList from './ActivityList';

import YoutubeUrlParser from '../models/YoutubeUrlParser';

export default class TabContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTabIndex: 0,
            lastUrlEntryState: null
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
                        <Tab label="DOWNLOAD" />
                        <Tab label="ACTIVITY" />
                    </Tabs>
                </AppBar>
                <div style={styleSheet.childContainer}>
                    {this.state.selectedTabIndex == 0 &&
                        <UrlEntry settings={this.props.settings} youtubeUrlParser={this.youtubeUrlParser} lastState={this.state.lastUrlEntryState} 
                            onSwitchTab={() => {this.switchToActivityTab()}} onSaveState={(savedState) => {this.setState({lastUrlEntryState: savedState})}} />
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

TabContainer.propTypes = {
    settings: PropTypes.object.isRequired
};