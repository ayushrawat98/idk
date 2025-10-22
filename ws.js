import {WebSocketServer} from "ws"

const wss = new WebSocketServer({port : 8080, path : "/ws"})

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