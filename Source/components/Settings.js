import React from 'react';
import { connect } from 'react-redux';

import { write, read, getPath } from '../models/FileAccess';
import { appSettings } from '../actions';

const path = window.require('path');

class Settings extends React.Component {
    constructor(props) {
        super(props);

        this.load().then((settings) => {
            this.props.dispatch(appSettings(settings));
            this.setState({
                loadCompleted: true
            });
        });

        this.state = { 
            loadCompleted: false 
        };
    }

    save(settings) {
        write(this.fileLocation(), JSON.stringify(settings));
    }

    load() {
        let self = this;

        return new Promise((resolve) => {
            read(self.fileLocation(), (error, data) => {
                if (!error) {
                    try {
                        let settingsData = JSON.parse(data);

                        self.raiseResponseCallback(resolve, settingsData.automaticallyPaste, settingsData.automaticallyGetVideo,
                            settingsData.automaticallyDownload, settingsData.saveToPath);

                        return;
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                
                self.returnDefaultSettings(resolve);
            });
        });
    }

    raiseResponseCallback(callback, automaticallyPaste, automaticallyGetVideo, automaticallyDownload, saveToPath) {
        callback({
            automaticallyPaste: automaticallyPaste,
            automaticallyGetVideo: automaticallyGetVideo,
            automaticallyDownload: automaticallyDownload,
            saveToPath: saveToPath
        });
    }

    returnDefaultSettings(resolve) {
        this.raiseResponseCallback(resolve, true, true, false, getPath("downloads"));
    }

    fileLocation() {
        return path.join(getPath('userData'), "UserSettings.json");
    }

    componentDidUpdate(prevProps) {
        if (prevProps.settings !== this.props.settings) {
            this.save(this.props.settings);
        }
    }

    render() {
        return (
            this.state.loadCompleted ? this.props.children : null
        );
    }
}

Settings.mapStateToProps = (state) => {
    return {
        settings: state.appSettings
    }
}

export default connect(Settings.mapStateToProps)(Settings);