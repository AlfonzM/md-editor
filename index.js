// MAIN PROCESS

'use strict';
const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
// const menus = require('./js/menus');

require('electron-debug')();


// prevent window being garbage collected
let mainWindow;

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
        // titleBarStyle: 'hidden',
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
    var menus = [];
    menus.push({
	    label: 'Markdown Editor',
	    submenu: [
	        { label: "About Markdown Editor", role: 'about' },
	    ]
	});
    menus.push({
	    label: 'File',
	    submenu: [
	        { label: "Save", click: function(){
	        }}
	    ]
	});
    menus.push({
	    label: 'Edit',
	    submenu: [
	        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
	        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
	        { type: "separator" },
	        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
	        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
	        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
	        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
	    ]
    });
    menus.push({
	    label: 'View',
	    submenu: [
	        { label: "Show/Hide Preview", accelerator: "CmdOrCtrl+P", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('togglePreview');
	        }},
	        { label: "Show/Hide Sidebar", accelerator: "CmdOrCtrl+\\", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('toggleSidebar');
	        }},
	        { label: "Show/Hide Editor", accelerator: "CmdOrCtrl+Shift+P", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('toggleEditor');
	        }}
	    ]
	});
    menus.push({
	    label: 'Window',
	    submenu: [
	        { label: "Show Next Note", accelerator: "Ctrl+Tab", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('nextNote');
	        }},
	        { label: "Show Previous Note", accelerator: "Ctrl+Shift+Tab", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('previousNote');
	        }}
	    ]
	});
	
    menus.push({
	    label: 'Development',
	    submenu: [{
	        label: 'Reload',
	        accelerator: 'CmdOrCtrl+R',
	        click: function () {
	            BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
	        }
	    },{
	        label: 'Toggle DevTools',
	        accelerator: 'Alt+CmdOrCtrl+I',
	        click: function () {
	            BrowserWindow.getFocusedWindow().toggleDevTools();
	        }
	    },{
	        label: 'Quit',
	        accelerator: 'CmdOrCtrl+Q',
	        click: function () {
	            app.quit();
	        }
	    }]
	});


    // if (env.name !== 'production') {
        // menus.push(devMenuTemplate);
    // }

    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};