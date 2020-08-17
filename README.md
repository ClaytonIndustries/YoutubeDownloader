# Youtube Downloader

Download videos from Youtube and optionally convert them to audio files

## Installation

No installtion is necessary, just download the release .zip, extract and run Youtube Downloader.exe

You can download the last release [here](https://github.com/ClaytonIndustries/YoutubeDownloader/releases), as well as see the full version history

## Source

If you want to run from source then you'll need the following installed

- Node
- Npm

Clone the project, then

- cd into the Source directory
- `npm install`
- `npm run build && npm run start`

FFmpeg is required for full functionality, it should be added to the dist folder inside a folder called FFmpeg. The correct structure can be seen in any of the existing releases

## Packaging

Electron packager is used to build the final distribution

electron-packager ./ --platform=win32 --arch=ia32 --icon="./images/YoutubeIcon.ico" --electron-version="9.2.0"