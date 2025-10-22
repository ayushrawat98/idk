import WebSocket from "ws";

const wss = new WebSocket.Server({port : 8080})

function broadcastUserCount() {
	const count = wss.clients.size
	wss.clients.forEach(client => {
		if(client.readyState === WebSocket.OPEN){
			client.send(count)
		}
	})
}

wss.on('connection', () =>{
	broadcastUserCount()
	wss.on('close', () => {
		broadcastUserCount()
	})
})