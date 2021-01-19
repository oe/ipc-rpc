const ipc = require('../dist/main')

const $ = (id) => {
  return document.getElementById(id.replace(/^\#/, ''))
}

// convert all error that on & onMsg handlers may throw
ipc.setErrorHandler((err) => err.toString())

// listen message send to main process via default channel
ipc.onMsg({
  // register getTitle method
  getTitle () {
    // throw 
    throw new Error(' can not get title')
  }
})

$('#text-input').addEventListener('input', function() {
  const text = this.value

  ipc.sendMsg('md5', text).then((md5) => {
    $('#md5-output').innerText = md5
  })
  
  // catch error if this method could failed
  ipc.sendMsg('sha1', text).then((sha1) => {
    $('#sha1-output').innerText = sha1
  }).catch(err =>{
    $('#sha1-output').innerText = 'error occurred ' + err
  })

})

$('#progress-btn').addEventListener('click', () => {
  ipc.sendMsg('download', {
    onprogress(progress) {
      $('#progress-output').innerText = progress
    }
  }).then((res) => {
    $('#progress-output').innerText = res
  })
})