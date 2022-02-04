import { WebSocketServer } from 'ws'

const port = 8080

const wss = new WebSocketServer({ port })

wss.on('connection', function connection(ws) {
	console.log('server running on', port)

	ws.on('message', function message(data) {
		console.log('received: %s', data)
	})

	ws.send('hello from server')
})
