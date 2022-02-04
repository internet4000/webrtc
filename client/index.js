// Create a WebRTC connection
const config = {iceServes: [{'urls': 'stun:stun.l.google.com:19302'}]}
const peer = new RTCPeerConnection(config)

// Create WebSocket connection
const host = 'localhost'
const socket = new WebSocket(`ws://${host}:8080`)

// Connection error
socket.addEventListener('error', function error(err) {
	console.error(err)
})

// Connection opened
socket.addEventListener('open', function (event) {
	socket.send('Hello Server, sent from client!')
})

// Listen for messages
socket.addEventListener('message', async function (event) {
	console.log('Message from server: ', event.data)

	if (event.data instanceof Blob) {
		const reader = new FileReader()
		reader.addEventListener('load', async () => {
			const msg = JSON.parse(reader.result)
			console.log(msg)

			if (msg.type === 'offer') {
				console.log('creating an offer')
				const desc = new RTCSessionDescription(msg)
				peer.setRemoteDescription(desc)
				console.log('.. and sending an answer')
				const answer = await peer.createAnswer()
				await peer.setLocalDescription(answer)
				socket.send(JSON.stringify(answer))
			}

			if (msg.type === 'answer') {
				console.log('setting an answer')
				const desc = new RTCSessionDescription(msg)
				await peer.setRemoteDescription(desc)
			}
		})
		reader.readAsText(event.data)
	}
})


document.querySelector('form').addEventListener('submit', sendMessage)
function sendMessage(event) {
	event.preventDefault()
	const data = new FormData(event.target)
	const msg = data.get('message')
	console.log('sending message', msg)
	socket.send(msg)
}

document.querySelector('button#connect').addEventListener('click', makeCall)
// server creates connection and receives "offer"
async function makeCall() {
	console.log('creating and sending offer')
	const offer = await peer.createOffer()
	console.log(offer)
	await peer.setLocalDescription(offer)
	socket.send(JSON.stringify(offer))
}
