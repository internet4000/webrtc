// Create WebSocket connection

function setupWebSockets() {
	const host = 'localhost'
	const socket = new WebSocket(`ws://${host}:8080`)
	socket.addEventListener('error', function error(err) {
		document.querySelector('form#websockets button').disabled = true
		console.error(err)
	})
	socket.addEventListener('open', function (event) {
		document.querySelector('form#websockets button').disabled = false
		socket.send('Hello Server, sent from client!')
	})
	socket.addEventListener('message', async function (event) {
		console.log('Message from socket server: ', event.data)
		if (event.data instanceof Blob) {
			const msg = processBlob(event.data)
			console.log(msg.type, msg)

		}
	})
	return socket
}

// Form to send message via websockets.
document.querySelector('form#websockets').addEventListener('submit', (event) => {
	event.preventDefault()
	const data = new FormData(event.target)
	const msg = data.get('message')
	console.log('sending via socket', msg)
	socket.send(msg)
})
