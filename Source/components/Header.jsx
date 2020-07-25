import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/SettingsOutlined';

import SettingsDialog from './SettingsDialog';

import { openItem } from '../models/ProcessStarter';
import { VERSION_NUMBER } from '../models/Constants';

const useStyles = makeStyles(() => ({
    card: {
        display: 'flex',
        margin: 0
    },
    image: {
        width: 90,
        height: 90
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        flex: '1 0 auto'
    },
    button: {
        padding: 0,
        marginRight: 20
    },
    settingsButton: {
        width: 60,
        height: 60
    },
    settingIcon: {
        width: 35,
        height: 35
    }
}));

const Header = () => {
    const classes = useStyles();

    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

    const openYoutube = () => openItem('https://www.youtube.com');

    const settingsDialogClose = () => setSettingsDialogOpen(false);

    return (
        <div className={classes.card}>
            <Button className={classes.button} onClick={openYoutube}>
                <img className={classes.image} src={'..\\images\\YoutubeIcon.png'} alt="Youtube Logo" />
            </Button>
            <div className={classes.details}>
                <Typography variant="h5" color="textSecondary">Clayton Industries</Typography>
                <Typography variant="h5" color="textSecondary">Youtube Downloader</Typography>
                <Typography variant="h5" color="textSecondary">{`Version ${VERSION_NUMBER}`}</Typography>
            </div>
            <IconButton className={classes.settingsButton} onClick={() => setSettingsDialogOpen(true)}>
                <DeleteIcon className={classes.settingIcon} />
            </IconButton>
            <SettingsDialog open={settingsDialogOpen} onClose={settingsDialogClose} />
        </div>
    );
};

export default Header;