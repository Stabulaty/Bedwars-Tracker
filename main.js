const { ipcMain, app, BrowserWindow, dialog } = require("electron")
const path = require("path");
const os = require("os");

let win

function createWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 400,
	frame: false,
	transparent: true,
	alwaysOnTop: true,
	resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");
}


app.whenReady().then(createWindow);


ipcMain.on('minimize', () => {
    win.minimize()
})

ipcMain.on('quit', () => {
    app.quit()
})

ipcMain.handle("pick-log", async () => {
  const wasOnTop = win.isAlwaysOnTop();

  win.setAlwaysOnTop(false);

  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    defaultPath: require("path").join(
      require("os").homedir(),
      "AppData",
      "Roaming",
      ".minecraft"
    ),
    filters: [
      { name: "Log Files", extensions: ["log"] }
    ]
  });

  win.setAlwaysOnTop(wasOnTop);

  return result.canceled ? null : result.filePaths[0];
});

