const electron = require('electron')
const proc = require('child_process')
const path = require('path')

// will print something similar to /Users/maf/.../Electron
console.log(electron)

// spawn Electron
const child = proc.spawn(electron, [path.join(__dirname, 'app.js')])