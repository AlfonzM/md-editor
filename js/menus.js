const electron = require('electron');
const app = electron.app;
const dialog = electron.dialog;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const syntaxes = require('./syntaxes').syntaxes;

var syntaxSubmenu = [];

[].forEach.call(syntaxes, function(syntax) {
	syntaxSubmenu.push({ label: syntax.name, type: 'radio', checked: false, click: function(menuItem, browserWindow, event) {
		BrowserWindow.getFocusedWindow().webContents.send('selectSyntax', syntax.syntax.toLowerCase() )}
	});
});

exports.menus = [
	{
	    label: 'Markdown Editor',
	    submenu: [
	        { label: "About Markdown Editor", role: 'about' },
	    ]
	},
    {
    	label: 'File',
	    submenu: [
	    { label: "Open", accelerator: "CmdOrCtrl+O", click: function() { 
	        var filename = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(),
	        {
	            properties: ['openFile'],
	            filters: [{name: 'Text', extensions: ['txt', 'md']}]
	        })

	        if(!filename) return;

	        fs.readFile(filename[0], 'utf8', function (err, data) {
	            if(err) {
	                alert(err)
	                return
	            } else {
	                console.log(data)
	                console.log("yus")
	                BrowserWindow.getFocusedWindow().webContents.send('loadEditorContents', data)
	            }
	        });
	    }},
	    { label: "Save", accelerator: "CmdOrCtrl+S", click: function() { 
	        // const db = low(__dirname + '/notesdb123')

	        // db.defaults({'notes': []}).value()
	        // var notes = db.get('notes').value()

	        BrowserWindow.getFocusedWindow().webContents.send('getEditorContents')
	    }},
	    ]
	},
    {
	    label: 'Edit',
	    submenu: [
	        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
	        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
	        { type: "separator" },
	        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
	        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
	        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
	        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
	        { type: "separator" },
	        { label: "Search Notes", accelerator: "CmdOrCtrl+Shift+F", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('focusSearchBox');
	        }}
	    ]
    },
    {
	    label: 'Find',
	    submenu: [
	        { label: "Find", accelerator: "CmdOrCtrl+F", click: function(){
	            // BrowserWindow.getFocusedWindow().webContents.send('togglePreview');
	        }},
	        { label: "Replace", accelerator: "CmdOrCtrl+Alt+F", click: function(){
	            // BrowserWindow.getFocusedWindow().webContents.send('togglePreview');
	        }},
	        { label: "Find in Files", accelerator: "CmdOrCtrl+Shift+F", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('focusSearchBox');
	        }}
	    ]
	},
    {
	    label: 'Note',
	    submenu: [
		    { label: "New note", accelerator: "CmdOrCtrl+N", click: function() {
	            BrowserWindow.getFocusedWindow().webContents.send('createNewNote')
		    }},
		    { label: "Favorite note", accelerator: "", click: function() {
	            BrowserWindow.getFocusedWindow().webContents.send('favoriteNote')
		    }},
		    { label: "Delete note", accelerator: "CmdOrCtrl+Shift+Delete", click: function() {
	            BrowserWindow.getFocusedWindow().webContents.send('deleteNote')
		    }},
		    { type: 'separator' },
		    { label: "Show All Notes", accelerator: "CmdOrCtrl+1", click: function() {
	            BrowserWindow.getFocusedWindow().webContents.send('selectNoteListType', 'all')
		    }},
		    { label: "Show Favorites", accelerator: "CmdOrCtrl+2", click: function() {
	            BrowserWindow.getFocusedWindow().webContents.send('selectNoteListType', 'favorites')
		    }},
		    { label: "Show Markdown Notes", accelerator: "CmdOrCtrl+3", click: function() {
	            BrowserWindow.getFocusedWindow().webContents.send('selectNoteListType', 'markdown')
		    }},
		    { label: "Show Code Notes", accelerator: "CmdOrCtrl+4", click: function() {
	            BrowserWindow.getFocusedWindow().webContents.send('selectNoteListType', 'code')
		    }},
		    { label: "Show Deleted Notes", accelerator: "CmdOrCtrl+5", click: function() {
	            BrowserWindow.getFocusedWindow().webContents.send('selectNoteListType', 'trash')
		    }}
	    ]
	},
    {
	    label: 'View',
	    submenu: [
	        { label: "Toggle Preview", accelerator: "CmdOrCtrl+P", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('togglePreview');
	        }},
	        { label: "Toggle Sidebar", accelerator: "CmdOrCtrl+\\", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('toggleSidebar');
	        }},
	        { type: 'separator' },
			{ label: "Syntax", submenu: syntaxSubmenu
			},
	        { type: 'separator' },
	        { label: "Actual Size", accelerator: "CmdOrCtrl+0", role: 'resetzoom' },
	        { label: "Zoom In", accelerator: "CmdOrCtrl+Shift+=", role: 'zoomin' },
	        { label: "Zoom Out", accelerator: "CmdOrCtrl+-", role: 'zoomout' },
	        { label: "Enter Full Screen", accelerator: 'Control+Command+F', role: 'togglefullscreen' },
	        // { label: "Toggle Editor", accelerator: "CmdOrCtrl+Shift+P", click: function(){
	        //     BrowserWindow.getFocusedWindow().webContents.send('toggleEditor');
	        // }}
	    ]
	},
    {
	    label: 'Window',
	    submenu: [
	        { label: "Show Next Note", accelerator: "Ctrl+Tab", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('nextNote');
	        }},
	        { label: "Show Previous Note", accelerator: "Ctrl+Shift+Tab", click: function(){
	            BrowserWindow.getFocusedWindow().webContents.send('previousNote');
	        }}
	    ]
	},
    {
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
	},
	{
		label: 'Help',
		role: 'help',
		submenu: [
	        // { label: "Help" },
		]
	}
];

// exports.menus = menus;