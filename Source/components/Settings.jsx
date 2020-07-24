import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { write, read, getPath } from '../models/FileAccess';
import { appSettings } from '../actions';

const path = window.require('path');

const Settings = (props) => {
    const { children } = props;

    const [loadCompleted, setloadCompleted] = useState(false);

    const settings = useSelector((state) => state.appSettings);

    const dispatch = useDispatch();

    const fileLocation = () => path.join(getPath('userData'), 'UserSettings.json');

    const save = () => write(fileLocation(), JSON.stringify(settings));

    const createResponse = (automaticallyPaste, automaticallyGetVideo, automaticallyDownload, saveToPath) => ({
        automaticallyPaste,
        automaticallyGetVideo,
        automaticallyDownload,
        saveToPath
    });

    const load = async () => {
        try {
            const data = await read(fileLocation());

            const settingsData = JSON.parse(data);

            return createResponse(settingsData.automaticallyPaste, settingsData.automaticallyGetVideo,
                settingsData.automaticallyDownload, settingsData.saveToPath);
        } catch (e) {
            return createResponse(true, true, false, getPath('downloads'));
        }
    };

    useEffect(() => {
        load().then((s) => {
            dispatch(appSettings(s));
            setloadCompleted(true);
        });
    }, []);

    useEffect(() => {
        if (settings) {
            save();
        }
    }, [settings]);

    return (
        loadCompleted ? children : null
    );
};

export default Settings;