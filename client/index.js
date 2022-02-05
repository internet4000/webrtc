function peerConnection() {
	// Create a WebRTC connection
	const config = {iceServes: [{urls: 'stun:stun.l.google.com:19302'}]}
	const peer = new RTCPeerConnection(config)

	// Listen for events on the webrtc peer.
	peer.onconnectionstatechange = function (event) {
		console.log('peer ocnnection state change', event)
		if (peer.connectionState === 'connected') {
			console.log('peers connected!!')
		}
	}
	peer.oniceconnectionstatechange = function (event) {
		console.log('ICE connection state change' + event.target.iceConnectionState)
	}
	peer.onicecandidate = async function (event) {
		const state = event.target.iceGatheringState
		console.log('onicecandidate', state)
		if (event.target.iceGatheringState == 'complete') {
			const offer = await peer.createOffer()
			console.log('offer (with ICE candidates)', encode(offer))
		}
	}
	peer.ondatachannel = function ({channel}) {
		console.log('ondatachannel', channel)
		channel.onopen = async function () {
			console.log('data channel open', channel.readyState)
		}
		channel.onclose = async function (event) {
			console.log('data channel close', event)
		}
		channel.onmessage = async function (event) {
			console.log('data channel message', decode(event.data))
		}
	}
	peer.onmessage = function (event) {
		console.log(event)
	}
	return peer
}

const peer = peerConnection()
const dataChannel = peer.createDataChannel('main')

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
	if (msg.type === 'offer') {
		const desc = new RTCSessionDescription(msg)
		peer.setRemoteDescription(desc)
		console.log('accepted offer')
		const answer = await peer.createAnswer()
		await peer.setLocalDescription(answer)
		console.log('answer', encode(answer))
	}
	if (msg.type === 'answer') {
		const desc = new RTCSessionDescription(msg)
		await peer.setRemoteDescription(desc)
		console.log('accepted answer')
	}
})

// Button that creates an offer and sends it
document.querySelector('button#connect').addEventListener('click', async (event) => {
	const offer = await peer.createOffer()
	await peer.setLocalDescription(offer)
	console.log('offer', encode(offer))
	event.target.disabled = true
})

// Helpers
const encode = (data) => btoa(JSON.stringify(data))
const decode = (data) => JSON.parse(atob(data))
