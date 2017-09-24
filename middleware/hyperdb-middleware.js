var hyperdb = require('hyperdb')
var ram = require('random-access-memory')
var Microframe = require('microframe')

let db
let dbCreating

const nextFrame = Microframe()

module.exports = function (state, emitter) {
  emitter.on('sendMessage', function (message) {
    console.log('sendMessage')
    state.messages.unshift(message)
    console.log('send message', state.messages)
    state.db.put('/messages', state.messages)
  })

  emitter.on('dbReady', function () {
    console.log('dbReady')
    if (!state.secretKey) {
      state.secretKey = state.db.key.toString('hex')
      emitter.emit('pushState', state.secretKey)
    }
    state.db.get('/messages', function (err, messages) {
      console.log('get', {messages})
      state.messages = messages
      emitter.emit('render')
    })
    state.db.watch('/messages', function (err, messages) {
      console.log('watch', {err, messages})
      state.db.get('/messages', function (err, record) {
        console.log('watch2', {err, record})
        state.messages = record[0].value
        emitter.emit('render')
      })
    })
  })

  emitter.on('dbCreate', function () {
    const secretKey = (state.params && state.params.secretKey) ? Buffer.from(state.params.secretKey, 'hex') : undefined
    console.log('dbCreate', secretKey)

    console.log('creating', dbCreating)

    if (dbCreating) {
      console.log('abort dbCreate')
      return
    }

    dbCreating = true

    console.log('dbCreate', {secretKey})

    state.db = hyperdb(function (filename) {
      return ram()
    },
    secretKey,
    {valueEncoding: 'json'})

    state.db.on('ready', function () {
      console.log('db ready')
      emitter.emit('dbReady')
      if (window) window.db = db
    })
  })

  emitter.on('DOMContentLoaded', function () {
    if (!module.parent || !dbCreating) {
      nextFrame(function () {
        emitter.emit('dbCreate')
      })
    }
  })
}
