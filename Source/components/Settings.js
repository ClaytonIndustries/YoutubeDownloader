import React from 'react';
import { connect } from 'react-redux';

import { write, read, getPath } from '../models/FileAccess';
import { appSettings } from '../actions';

const path = window.require('path');

class Settings extends React.Component {
    constructor(props) {
        super(props);

        this.load().then((settings) => {
            this.props.appSettings(settings);
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

    async load() {
        let self = this;

        try {
            let data = await read(self.fileLocation());

            let settingsData = JSON.parse(data);

            return self.createResponse(settingsData.automaticallyPaste, settingsData.automaticallyGetVideo, 
                settingsData.automaticallyDownload, settingsData.saveToPath);
        }
        catch (e) {
            console.error(e);
            return self.createResponse(true, true, false, getPath("downloads"));
        }       
    }

    createResponse(automaticallyPaste, automaticallyGetVideo, automaticallyDownload, saveToPath) {
        return {
            automaticallyPaste: automaticallyPaste,
            automaticallyGetVideo: automaticallyGetVideo,
            automaticallyDownload: automaticallyDownload,
            saveToPath: saveToPath
        };
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

const mapDispatchToProps = {
    appSettings
}

export default connect(Settings.mapStateToProps, mapDispatchToProps)(Settings);