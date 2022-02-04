import WebSocket, {WebSocketServer} from 'ws'

// const ws = new WebSocket('ws://www.host.com/path')

// ws.on('open', function open() {
// 	ws.send('something')
// })

// ws.on('message', function message(data) {
// 	console.log('received: %s', data)
// })

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('hello from server');
});