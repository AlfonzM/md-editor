// MAIN PROCESS

'use strict';
const electron = require('electron');
const app = electron.app;
const dialog = electron.dialog;
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const menus = require('./js/menus');
const fs = require('fs');

require('electron-debug')();


// prevent window being garbage collected
let mainWindow;
var applicationMenus;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 1000,
        // transparent: true,
        height: 600,
        titleBarStyle: 'hidden',
	});

    setApplicationMenu();

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

    win.openDevTools();

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});



var setApplicationMenu = function () {
    applicationMenus = Menu.buildFromTemplate(menus.menus);
    Menu.setApplicationMenu(applicationMenus);
};

var setSelectedSyntax = function(index = 0){
    applicationMenus.items[5].submenu.items[3].submenu.items[index].checked = true;
}



// IPC Listeners

ipcMain.on('saveFile', (event, data) => {
    console.log('save file');
    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(),
    {
        defaultPath: 'Untitled.md',
    },
    function(fileName) {
        console.log(fileName)
        console.log(data)
        if (fileName === undefined) return;
        fs.writeFile(fileName, data, function (err) {   
            console.log(err)
        })
    })
})

ipcMain.on('selectSyntax', (event, data) => {
    setSelectedSyntax(data);
})