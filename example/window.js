$(() => {
  const crypto = require('crypto')
  const ipc = require('./renderer')

  $('#text-input').bind('input propertychange', function() {
    const text = this.value

    // const md5 = crypto.createHash('md5').update(text, 'utf8').digest('hex')
    ipc.sendMsg('md5', text).then((md5) => {
      $('#md5-output').text(md5)
    })
    

    // const sha1 = crypto.createHash('sha1').update(text, 'utf8').digest('hex')
    ipc.sendMsg('sha1', text).then((sha1) => {
      $('#sha1-output').text(sha1)
    })

    // const sha256 = crypto.createHash('sha256').update(text, 'utf8').digest('hex')
    ipc.sendMsg('sha256', text).then((sha256) => {
      $('#sha256-output').text(sha256)
    })

    // const sha512 = crypto.createHash('sha512').update(text, 'utf8').digest('hex')
    ipc.sendMsg('sha512', text).then((sha512) => {
      $('#sha512-output').text(sha512)
    })
  })

  $('#text-input').focus() // focus input box
})
