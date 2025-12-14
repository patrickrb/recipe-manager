const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let nextServer;

async function startNextServer() {
  return new Promise((resolve, reject) => {
    // Start Next.js server in production mode
    nextServer = spawn('npm', ['run', 'start'], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      env: { ...process.env, PORT: '3000' }
    });

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.toString().includes('Ready') || data.toString().includes('started')) {
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    nextServer.on('error', (error) => {
      reject(error);
    });

    // Timeout after 30 seconds
    setTimeout(() => resolve(), 30000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
  });

  mainWindow.loadURL('http://localhost:3000');

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  if (!isDev) {
    await startNextServer();
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (nextServer) {
      nextServer.kill();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});
