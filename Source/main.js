const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

require('electron-reload')(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
    const winWidth = 800;
    const winHeight = 745;

    win = new BrowserWindow({
        width: winWidth,
        height: winHeight,
        useContentSize: false,
        icon: path.join(__dirname, 'images/YoutubeIcon.png'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.webContents.openDevTools();
    win.autoHideMenuBar = true;
    win.setMenuBarVisibility(false);

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})