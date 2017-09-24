var html = require('choo/html')

var TITLE = '🚂🚋🚋'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  if (!state.message) state.message = ''
  if (!state.messages) state.messages = []

  console.log({state})

  function createChannel () {
    emit('dbCreate')
  }

  function updateMessage (e) {
    state.message = e.target.value
  }

  function sendMessage (e) {
    emit('sendMessage', state.message)
    state.message = ''
    emit('render')
  }

  function displayMessage (message) {
    return html`
      <p>${message}</p>
    `
  }

  function createOrJoin (secretKey) {
    console.log({secretKey})
    if (!secretKey) {
      return html`
        <button onclick=${createChannel}>create channel</button>
      `
    }
    return html`
      <div>
        <input
          oninput=${updateMessage}
          onchange=${sendMessage}
        />
        ${state.messages ? state.messages.map(displayMessage) : ''}
        <h6>${secretKey}</h6>
      </div>
    `
  }

  return html`
    <body class="sans-serif">
      ${createOrJoin(state.params.secretKey)}
    </body>
  `
}
