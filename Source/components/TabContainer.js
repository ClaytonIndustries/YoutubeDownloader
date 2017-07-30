import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import UrlEntry from './UrlEntry';
import ActivityList from './ActivityList';

export default class TabContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTabIndex: 0,
            videos: [],
            lastUrlEntryState: null
        };
    }

    handleTabChange(event, index) {
        this.setState({ 
            selectedTabIndex: index
        });
    };

    startDownload(video) {
        let videos= this.state.videos.slice();
        videos.push(video);

        this.setState({
            videos: videos,
            selectedTabIndex: 1
        });
    }

    removeVideo(index) {
        let videos = this.state.videos.slice();
        videos.splice(index, 1);

        this.setState({
            videos: videos
        });
    }

    render() {
        const styleSheet = this.getStyles();

        return (
            <div style={styleSheet.tabContainer}>
                <AppBar position="static">
                    <Tabs fullWidth centered index={this.state.selectedTabIndex} onChange={(event, index) => {this.handleTabChange(event, index)}}>
                        <Tab label="DOWNLOAD" />
                        <Tab label="ACTIVITY" />
                    </Tabs>
                </AppBar>
                <div style={styleSheet.childContainer}>
                    {this.state.selectedTabIndex == 0 &&
                        <UrlEntry settings={this.props.settings} lastState={this.state.lastUrlEntryState} 
                            onDownload={(video) => {this.startDownload(video)}} onSaveState={(savedState) => {this.setState({lastUrlEntryState: savedState})}} />
                    }
                    {this.state.selectedTabIndex == 1 &&
                        <ActivityList videos={this.state.videos} onRemoveVideo={(index) => {this.removeVideo(index)}} />
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