import React from 'react';
import ReactDOM from 'react-dom';

import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import UrlEntry from './UrlEntry';
import ActivityList from './ActivityList';

export default class TabContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index: 0
        };
    }

    handleChange(event, index) {
        this.setState({ 
            index: index
        });
    };

    startDownload(video) {
    }

    render() {
        const tabContainerStyle = {
            marginTop: 10
        };

        const childContainerStyle = {
            marginLeft: 5,
            marginRight: 5,
            marginTop: 15,
            marginBottom: 5
        };

        return (
            <div style={tabContainerStyle}>
                <AppBar position="static">
                    <Tabs fullWidth centered index={this.state.index} onChange={(event, index) => {this.handleChange(event, index)}}>
                        <Tab label="DOWNLOAD" />
                        <Tab label="ACTIVITY" />
                    </Tabs>
                </AppBar>
                <div style={childContainerStyle}>
                    {this.state.index == 0 &&
                        <UrlEntry onDownload={(video) => {this.startDownload(video)}} />
                    }
                    {this.state.index == 1 &&
                        <ActivityList />
                    }
                </div>
          </div>
        );
    }
}