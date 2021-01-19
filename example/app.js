const electron = require('electron')
const path = require('path')
const url = require('url')
const crypto = require('crypto')
const ipc = require('../dist/main')

const {app, BrowserWindow} = electron


const handlers = {
  md5: (text) => crypto.createHash('md5').update(text, 'utf8').digest('hex'),
  sha1: (text) => {
    return cryptoss.createHash('sha1').update(text, 'utf8').digest('hex')
  },
  // mock download
  download(options) {
    return new Promise((resolve, reject) => {
      let progress = 0
      let tid = setInterval(() => {
        if (progress >= 100) {
          clearInterval(tid)
          return resolve('download complete')
        }
        options.onprogress(progress++)
      }, 100)
    })
  }
}


let window = null

// Wait until the app is ready
app.once('ready', () => {
  ipc.onMsg(handlers)
  // Create a new window
  window = new BrowserWindow({
    // Set the initial width to 800px
    width: 800,
    // Set the initial height to 600px
    height: 600,
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    backgroundColor: "#D6D8DC",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Load a URL in the window to the local index.html path
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  setTimeout(() => {
    console.log('sendMsg from main', electron.webContents, window.webContents)
    ipc.sendMsg(window.webContents, 'getTitle').then(res => {
      console.log('renderer webpage title', res)
    }).catch((err) => {
      console.log(typeof err, err)
    })
  }, 2000)

  // Show window when page is ready
  window.once('ready-to-show', () => {
    window.show()
  })
})
