# Youtube Downloader

## Requirements

- Node
- Npm

## Setup

- cd into the Source directory
- npm install
- npm run build && npm run start

FFmpeg is required to for full functionality, it should be added to the dist folder inside a folder called FFmpeg

## Packaging

electron-packager ./ --platform=win32 --arch=ia32 --icon="./images/YoutubeIcon.ico" --electron-version="9.1.0"