const electron = require('electron')
const path = require('path')
const url = require('url')
const crypto = require('crypto')
const ipc = require('./main')

const {app, BrowserWindow} = electron

console.log(typeof electron)

const handlers = {
  md5: (text) => crypto.createHash('md5').update(text, 'utf8').digest('hex'),
  sha1: (text) => crypto.createHash('sha1').update(text, 'utf8').digest('hex'),
  sha256: (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex'),
  sha512: (text) => crypto.createHash('sha512').update(text, 'utf8').digest('hex')
}

function createHandleProxy(handlers) {
  return function doHandler(method, ...args) {
    const handler = handlers[method]
    if (!handler) {
      throw new Error(`can not find handle for ${method}`)
    }
    return handler.apply(null, ...arg)
  }
}



let window = null

// Wait until the app is ready
app.once('ready', () => {
  ipc.on('messagehub', createHandleProxy(handlers))
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
    show: false
  })

  // Load a URL in the window to the local index.html path
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Show window when page is ready
  window.once('ready-to-show', () => {
    window.show()
  })
})
