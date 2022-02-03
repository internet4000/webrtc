// window.geckos
// import { geckos } from '@geckos.io/server'

console.log('hello')
const channel = geckos({
	// url: 'http://127.0.0.1',
	port: 9208,
	// iceServers: geckos.iceServers,
})

channel.onConnect((error) => {
	if (error) {
		console.error(error.message)
		return
	}
	console.log('connected')
	appendMessage('connected')

	channel.onDisconnect((what) => {
		console.log('disconnected')
		appendMessage('disconnected')
	})

	channel.on('chat message', (data) => {
		console.log(`You got the message`, data)
		appendMessage(data)
	})

	channel.emit('chat message', `Hello I am ${channel.id}`)
	// channel.close()
})

document.querySelector('form').addEventListener('submit', (event) => {
	event.preventDefault()
	const data = new FormData(event.target)
	const msg = data.get('message')
	console.log('sending message', msg)
	channel.emit('chat message', msg)
})

function appendMessage(msg) {
	const list = document.querySelector('#list')
	const li = document.createElement('li')
	li.innerHTML = msg
	list.appendChild(li)
}
