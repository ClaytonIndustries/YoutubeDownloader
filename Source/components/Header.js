import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/SettingsOutlined';

import SettingsDialog from './SettingsDialog';

import ProcessStarter from '../models/ProcessStarter';
import { VERSION_NUMBER } from '../models/Constants';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settingsDialogOpen: false
        };

        this.processStarter = new ProcessStarter();
    }

    openYoutube() {
        this.processStarter.openItem("https://www.youtube.com");
    }

    settingsDialogClose() {
        this.setState({
            settingsDialogOpen: false
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.card}>
                <Button className={classes.button} onClick={() => {this.openYoutube()}}>
                    <img className={classes.image} src={'images\\YoutubeIcon.png'} />
                </Button>
                <div className={classes.details}>
                    <Typography variant="h5" color="textSecondary">Clayton Industries</Typography>
                    <Typography variant="h5" color="textSecondary">Youtube Downloader</Typography>
                    <Typography variant="h5" color="textSecondary">{"Version " + VERSION_NUMBER}</Typography>
                </div>
                <IconButton className={classes.settingsButton} onClick={() => {this.setState({settingsDialogOpen: true})}}>
                    <DeleteIcon className={classes.settingIcon} />
                </IconButton>
                <SettingsDialog open={this.state.settingsDialogOpen} onClose={() => {this.settingsDialogClose()}} />
            </div>
        );
    }
}

const styles = theme => ({
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
});

export default withStyles(styles)(Header);