const { ipcMain, app, BrowserWindow, dialog } = require("electron")
const path = require("path");
const os = require("os");
const fs = require("fs");

let win

// Speicherort der Positionsdatei
const positionPath = path.join(app.getPath("userData"), "position.json");

function createWindow() {

  // Gespeicherte Position laden
  let position = {};

  if (fs.existsSync(positionPath)) {
    try {
      position = JSON.parse(fs.readFileSync(positionPath, "utf8"));
    } catch (error) {
      position = {};
    }
  }

  win = new BrowserWindow({
    width: 600,
    height: 400,
    x: position.x,
    y: position.y,
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

  // Position beim Schließen speichern
  win.on("close", () => {
    const bounds = win.getBounds();

    fs.writeFileSync(positionPath, JSON.stringify({
      x: bounds.x,
      y: bounds.y
    }));
  });
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

