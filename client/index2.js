const url = 'https://global.xirsys.net'
const channelPath = 'i4k'
const headers = {
	Authorization: 'Basic ' + btoa('oskar:1fc96ac4-8547-11ec-a27f-0242ac130002'),
}

async function authorize(user) {
	if (!user) throw new Error('Username is required')
	console.log('getting token and host')
	const res = await fetch(`${url}/_token/${channelPath}?k=${user}&expire=30`, {
		method: 'PUT',
		headers: headers,
	})
	const { v: token } = await res.json()
	console.log({token})
	const res2 = await fetch(`${url}/_host/${channelPath}?k=${user}&type=signal`, {
		headers,
	})
	const { v: host } = await res2.json()
	console.log({host})
	return { token, host }
}

function createSignal({ token, host }) {
	// WebSocket
	const signalPath = `${host}/v2/${token}`
	const sig = new WebSocket(signalPath)

	sig.addEventListener('open', () => {
		console.log('open')
		keepAlive()
	})

	// Listen for message events
	sig.addEventListener('message', (msg) => {
		const parsedMessage = JSON.parse(msg.data)
		console.log(parsedMessage)
		const eventLabel = parsedMessage.m.o

		// const pkt = JSON.parse(msg.data)
		// var payload = pkt.p //the actual message data sent
		// var meta = pkt.m //meta object
		// var msgEvent = meta.o //event label of message
		// var toPeer = meta.t //msg to user (if private msg)
		// var fromPeer = meta.f //msg from user

		// switch (msgEvent) {
		// 	//first connect, list of all peers connected.
		// 	case 'peers':
		// 		//this is first call when you connect,
		// 		//  so we can check for channelPath here dynamically.
		// 		var sysNum = meta.f.lastIndexOf('__sys__')
		// 		if (sysNum > -1 && !channelPath) {
		// 			channelPath = meta.f.substring(0, sysNum) //save message path for sending.
		// 		}
		// 		console.log(payload).users
		// 		break
		// 	//new peer connected
		// 	case 'peer_connected':
		// 		console.log('peer connected')
		// 		// addUser(fromPeer)
		// 		break
		// 	//peer left.
		// 	case 'peer_removed':
		// 		console.log('peer removed')
		// 		// removeUser(fromPeer)
		// 		break
		// 	case 'message':
		// 		console.log(fromPeer + ' says: ' + payload)
		// 		break
		// }
	})

	// Keeps socket open
	let heartbeat
	function keepAlive() {
		heartbeat = setInterval(function () {
			sig.send('ping')
		}, 800)
	}

	return sig
}

function createMessage(msg, { user }) {
	const pkt = {
		t: 'u',
		m: {
			f: `${channelPath}/${user}`,
			//t: [Optional Remote User Name],
			o: 'message',
		},
		p: { msg },
	}
	return sig.send(JSON.stringify(pkt))
}

async function main() {
	const user = 'jante'
	const { token, host } = await authorize(user)
	const sig = await createSignal({ token, host, user })
	// console.log(sig)
	// createMessage('hello ida', {user})
}

main()

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

