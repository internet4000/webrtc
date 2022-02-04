// import {createServer} from 'https'
import { WebSocketServer } from 'ws'

const port = 8080

// const server = createServer()
const wss = new WebSocketServer({port})

wss.on('connection', function connection(ws) {
	console.log('server running on', port)

	ws.on('message', function message(data) {
		console.log('received: %s', data)
		// for (let client of clients) {
		// 	client.send(msg)
		// }
	})
	ws.send('hello from server')
})

// server.listen(port)