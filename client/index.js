// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:8080');

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('Hello Server, sent from client!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});

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
