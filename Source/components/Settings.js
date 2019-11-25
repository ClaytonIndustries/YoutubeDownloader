import React from 'react';
import { connect } from 'react-redux';

import FileAccess from '../models/FileAccess';
import { appSettings } from '../actions';

const path = window.require('path');

class Settings extends React.Component {
    constructor(props) {
        super(props);

        this.fileAccess = new FileAccess();

        this.load().then((settings) => {
            this.props.dispatch(appSettings(settings));
        });
    }

    save(settings) {
        this.fileAccess.write(this.fileLocation(), JSON.stringify(settings));
    }

    load() {
        let self = this;

        return new Promise((resolve) => {
            self.fileAccess.read(self.fileLocation(), (error, data) => {
                if (!error) {
                    try {
                        let settingsData = JSON.parse(data);

                        self.raiseResponseCallback(resolve, settingsData.automaticallyPaste, settingsData.automaticallyGetVideo,
                            settingsData.automaticallyDownload, settingsData.saveToPath);

                        return;
                    }
                    catch (e) {
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
        this.raiseResponseCallback(resolve, true, true, false, this.fileAccess.getPath("downloads"));
    }

    fileLocation() {
        return path.join(this.fileAccess.getPath('userData'), "UserSettings.json");
    }

    componentDidUpdate(prevProps) {
        if (prevProps.settings !== this.props.settings) {
            this.save(this.props.settings);
        }
    }

    render() {
        return null;
    }
}

Settings.mapStateToProps = (state) => {
    return {
        settings: state.appSettings
    }
}

export default connect(Settings.mapStateToProps)(Settings);