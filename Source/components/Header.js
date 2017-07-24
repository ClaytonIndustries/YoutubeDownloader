import React from 'react';
import ReactDOM from 'react-dom';

import Button from 'material-ui/Button';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const cardStyle = {
            display: 'flex',
            margin: 0
        };

        const imageStyle = {
          width: 90,
          height: 90  
        };

        const detailsStyle = {
            display: 'flex',
            flexDirection: 'column',
            flex: '1 0 auto'
        };

        const buttonStyle = {
            padding: 0,
            marginRight: 20
        };

        return (
            <div style={cardStyle}>
                <Button style={buttonStyle}>
                    <img style={imageStyle} src={'images\\YoutubeIcon.png'} />
                </Button>
                <div style={detailsStyle}>
                    <Typography type="headline" color="secondary">Clayton Industries</Typography>
                    <Typography type="headline" color="secondary">Youtube Downloader</Typography>
                    <Typography type="headline" color="secondary">Version 1.0</Typography>
                </div>
            </div>
        );
    }
}