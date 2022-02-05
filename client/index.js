// Create a WebRTC connection
const config = {iceServes: [{urls: 'stun:stun.l.google.com:19302'}]}
const peer = new RTCPeerConnection(config)

window.peer = peer

// Attach a data channel for later.
const dataChannel = peer.createDataChannel('main')
function handleChannel(channel) {
	channel.onopen = async function (event) {
		console.log('data channel open', channel.readyState)
	}
	channel.onclose = async function (event) {
		console.log('data channel close', event)
	}
	channel.onmessage = async function (event) {
		console.log('data channel message')
		console.log(decode(event.data))
	}
}

// Listen for events on the webrtc peer.
peer.onconnectionstatechange = function (event) {
	console.log('peer ocnnection state change', event)
	if (peer.connectionState === 'connected') {
		console.log('peers connected!!')
	}
}
peer.onicecandidate = async function (event) {
	const state = event.target.iceGatheringState
	console.log('onicecandidate', state)
	if (event.target.iceGatheringState == 'complete') {
		const offer = await peer.createOffer()
		console.log('Created new offer with ICE candidates')
		console.log(encode(offer))
	}
}
peer.oniceconnectionstatechange = function (event) {
	console.log('ICE connection state change' + event.target.iceConnectionState)
}
peer.ondatachannel = function ({channel}) {
	console.log('ondatachannel', channel)
	handleChannel(channel)
}

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
			if (msg.type === 'candidate') {
				try {
					console.log('adding candidate to peer')
					peer.addIceCandidate(msg.candiate)
				} catch (err) {
					console.error('Error adding ice candidate')
				}
			}
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

// Form to send message via WebRTC.
document.querySelector('form#webrtc').addEventListener('submit', (event) => {
	event.preventDefault()
	const data = new FormData(event.target)
	const msg = data.get('message')
	console.log('sending via webrtc', msg)
	dataChannel.send(encode({custom: 'yolo', msg}))
})

document.querySelector('form#webrtc-offer').addEventListener('submit', async (event) => {
	event.preventDefault()
	const data = new FormData(event.target)
	const msg = decode(data.get('message'))
	console.log(msg)
	const type = msg.type
	if (msg.type === 'offer') {
		const desc = new RTCSessionDescription(msg)
		peer.setRemoteDescription(desc)
		const answer = await peer.createAnswer()
		await peer.setLocalDescription(answer)
		console.log('accepted offer, here is the answer', encode(answer))
	}

	if (msg.type === 'answer') {
		const desc = new RTCSessionDescription(msg)
		await peer.setRemoteDescription(desc)
		console.log('accepted answer')
	}

	if (msg.type === 'candidate') {
		console.log('received candidate, adding to local peer', msg.candidate)
		peer.addIceCandidate(msg.candidate)
		// socket.send(JSON.stringify({type: 'candidate', candidate}))
	}
})

// Button that creates an offer and sends it
document.querySelector('button#connect').addEventListener('click', async () => {
	const offer = await peer.createOffer()
	await peer.setLocalDescription(offer)
	console.log('creating offer', encode(offer))
	// socket.send(JSON.stringify(offer))
})

// Helpers
function processBlob(blob) {
	const promise = new Promise()
	const reader = new FileReader()
	reader.addEventListener('load', () => resolve(reader.result))
	reader.readAsText(blob)
	return promise
}
const encode = (data) => btoa(JSON.stringify(data))
const decode = (data) => JSON.parse(atob(data))
