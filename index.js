const { app, BrowserWindow } = require('electron');

function createWindow () {
  let appWindow = new BrowserWindow({ width: 1024, height: 768 });

	appWindow.on('closed', () => {
		appWindow = null
	});

	appWindow.loadFile('assets/index.html');
}

app.on('ready', createWindow);