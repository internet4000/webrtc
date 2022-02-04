import WebSocket, {WebSocketServer} from 'ws'

const port = 8080
const wss = new WebSocketServer({port})

wss.on('connection', function connection(ws) {
	console.log('server running on', port)

	ws.on('message', function message(data, isBinary) {
		console.log('received: %s', data)
		console.log(wss.clients.size)
		// if (typeof data === 'string') return
		// let parsed = data
		try {
			let parsed = JSON.parse(data)
			console.log(parsed)
			if (parsed.type === 'offer' || parsed.type === 'answer' || parsed.type === 'candidate') {
				for (let client of wss.clients) {
					if (client !== ws && client.readyState === WebSocket.OPEN) {
						client.send(data)
					}
				}
			}
		} catch (err) {
			// console.error(err)
		}
		console.log(data)
	})

	ws.send('hello from server')
})
