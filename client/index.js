function peerConnection() {
	const config = {
		iceServers: [{urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478']}],
	}
	const peer = new RTCPeerConnection(config)

	// Listen for events on the webrtc peer.
	peer.onconnectionstatechange = function (event) {
		console.log('peer connection state change', event)
		if (peer.connectionState === 'connected') {
			console.log('peers connected!!')
		}
	}
	peer.onsignalingstatechange = function (event) {
		console.log(
			'peer signalingstatechange',
			event.target.iceConnectionState,
			event.target.iceGatheringState,
			event.target.signalingState
		)
	}
	peer.oniceconnectionstatechange = function (event) {
		console.log('peer ice connection state change' + event.target.iceConnectionState)
	}
	peer.onicecandidate = async function (event) {
		const state = event.target.iceGatheringState
		console.log('peer onicecandidate', state)
		if (event.candidate) {
			console.log('candidate to send', event.candidate)
			// send to other peer
		} else {
			console.log('trickle ice done?')
			console.log(peer.localDescription.type)
			const offer = await peer.createOffer()
			// Run this? Not sure. Maybe on peer1 only. setRemoteDescription(offer)
			console.log('offer (with ICE candidates)', encode(offer))
		}
		if (state == 'complete') {
		}
	}
	peer.ondatachannel = function ({channel}) {
		console.log('ondatachannel', channel)
		channel.onopen = async function () {
			console.log('data channel open')
			document.querySelector('form#webrtc button').disabled = false
		}
		channel.onclose = async function (event) {
			console.log('data channel close', event)
		}
		channel.onmessage = async function (event) {
			console.log('data channel message', decode(event.data))
		}
		channel.onerror = function (event) {
			console.error(event.error)
		}
	}
	return peer
}

// Create the peer connection with a data channel.
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

// This is the signaling part, but we do it manually with textarea + copy/paste.
document.querySelector('form#webrtc-signal').addEventListener('submit', async (event) => {
	event.preventDefault()
	const data = new FormData(event.target)
	const msg = decode(data.get('message'))
	if (msg.sdp) {
		console.log('accepted remote description')
		const desc = new RTCSessionDescription(msg)
		peer.setRemoteDescription(desc)
		if (msg.type === 'offer') {
			console.log('setting local description with answer')
			const answer = await peer.createAnswer()
			await peer.setLocalDescription(answer)
			console.log('answer', encode(answer))
		}
		if (msg.type === 'answer') {
		}
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
// for debugging
window.i4k = {peer, encode, decode}
