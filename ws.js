import {WebSocketServer} from "ws"
import WebSocket from "ws"

const wss = new WebSocketServer({port : 8080, path : "/ws"})

let map = {}

function broadcastUserCount() {
	// const count = wss.clients.size
	const count = Object.keys(map).length
	wss.clients.forEach(client => {
		if(client.readyState === WebSocket.OPEN){
			client.send(count)
		}
	})
}

wss.on('connection', (ws, req) =>{
	console.log("connected")
	const ip = req.headers['x-real-ip'].split(',')[0].trim();
	map[ip] = 1
	broadcastUserCount()
	ws.on('close', () => {
		delete map[ip]
		broadcastUserCount()
		console.log("closed")
	})
})