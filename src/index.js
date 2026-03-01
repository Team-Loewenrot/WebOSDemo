const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('fs')


if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow
let dataPath
let notesPath
let configPath

function setupDataStructure() {
  const basePath = app.getPath('userData')

  dataPath = path.join(basePath, 'DATA')
  notesPath = path.join(dataPath, 'Notes')
  configPath = path.join(dataPath, 'config.json')

  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath)
  }

  if (!fs.existsSync(notesPath)) {
    fs.mkdirSync(notesPath)
  }

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify({ firstRun: true }, null, 2)
    )
  }

  const config = JSON.parse(fs.readFileSync(configPath))

  if (config.firstRun) {
    const welcomePath = path.join(notesPath, 'Welcome.txt')

    if (!fs.existsSync(welcomePath)) {
      fs.writeFileSync(
        welcomePath,
        'Welcome to your WebOS Notes.\n\nStart building something great.'
      )
    }

    config.firstRun = false
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0b0b0b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })
}

app.whenReady().then(() => {
  setupDataStructure()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


ipcMain.handle('notes:list', () => {
  return fs.readdirSync(notesPath).filter(f => f.endsWith('.txt'))
})

ipcMain.handle('notes:load', (event, filename) => {
  const filePath = path.join(notesPath, filename)
  if (!fs.existsSync(filePath)) return ''
  return fs.readFileSync(filePath, 'utf-8')
})

ipcMain.handle('notes:save', (event, filename, content) => {
  const filePath = path.join(notesPath, filename)
  fs.writeFileSync(filePath, content)
})

ipcMain.handle('notes:create', (event, filename) => {
  const filePath = path.join(notesPath, filename)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '')
  }
})