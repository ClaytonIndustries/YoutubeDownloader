Youtube Downloader Electron Readme File

-------------------------------
Setup
-------------------------------

cd into the Source directory

npm install browserify -g
npm install watchify -g

npm install

-------------------------------
Packaging
-------------------------------

electron-packager ./ --platform=win32 --arch=ia32 --icon="./images/YoutubeIcon.ico" --electron-version="1.7.9"