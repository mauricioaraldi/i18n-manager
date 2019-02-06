const { app, BrowserWindow } = require('electron');

function createWindow () {
	let appWindow = new BrowserWindow({
		height: 768,
		width: 1024,

		webPreferences: {
			nodeIntegration: true
		}
	});

	appWindow.on('closed', () => {
		appWindow = null
	});

	appWindow.loadFile('assets/index.html');
}

app.on('ready', createWindow);