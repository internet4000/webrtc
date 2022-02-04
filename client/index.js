// Create a WebRTC connection
// const config = {iceServes: [{'urls': 'stun:stun.l.google.com:19302'}]}
const config = {}
const peer = new RTCPeerConnection(config)
const dataChannel = peer.createDataChannel('main')

dataChannel.onopen = async function (event) {
	console.log('data channel open', dataChannel.readyState)
}
dataChannel.onclose = async function (event) {
	console.log('data channel close')
}
dataChannel.onmessage = async function (event) {
	console.log('data channel msg', event.data)
}

peer.onconnectionstatechange = function (event) {
	console.log('peer ocnnection state change', event)
}

peer.onicecandidate = function (event) {
	if (event.candidate) {
		console.log('candidate', event.candidate)
		socket.send(JSON.stringify({
			type: 'candidate',
			candidate: event.candidate,
		}))
	}
}

peer.ondatachannel = function (event) {
	console.log('ondatachannel')
	var receiveChannel = event.channel
	receiveChannel.onmessage = function (event) {
		console.log('ondatachannel message:', event.data)
	}
}

// Listen for connectionstatechange on the local RTCPeerConnection
peer.addEventListener('connectionstatechange', (event) => {
	if (peer.connectionState === 'connected') {
		console.log('peers connected!!')
		// Peers connected!
	}
})

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
	console.log('Message from socket server: ', event.data)

	if (event.data instanceof Blob) {
		const reader = new FileReader()
		reader.addEventListener('load', async () => {
			const msg = JSON.parse(reader.result)
			console.log(msg.type, msg)

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

			if (msg.type === 'candidate') {
				try {
					console.log('adding candidate to peer')
					peer.addIceCandidate(msg.candiate)
				} catch (err) {
					console.error('Error adding ice candidate')
				}
			}
		})

		// This is just here to trigger the onload
		reader.readAsText(event.data)
	}
})

// Listen for data channel events
socket.addEventListener('datachannel', function (event) {
	const channel = event.channel
	channel.addEventListener('open', (event) => {
		console.log('opened data channel')
	})
	channel.addEventListener('close', (event) => {
		console.log('closed data channel')
	})
})

document.querySelector('form#websockets').addEventListener('submit', (event) => {
	event.preventDefault()
	const data = new FormData(event.target)
	const msg = data.get('message')
	console.log('sending via socket', msg)
	socket.send(msg)
})

document.querySelector('form#webrtc').addEventListener('submit', (event) => {
	event.preventDefault()
	const data = new FormData(event.target)
	const msg = data.get('message')
	console.log('sending via webrtc', msg)
	dataChannel.send({custom: 'yolo', msg})
})

document.querySelector('button#connect').addEventListener('click', makeCall)
// server creates connection and receives "offer"
async function makeCall() {
	console.log('creating and sending offer')
	const offer = await peer.createOffer()
	console.log(offer)
	await peer.setLocalDescription(offer)
	socket.send(JSON.stringify(offer))
}
