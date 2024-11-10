import WebSocket, { WebSocketServer } from "ws"

const ws = new WebSocketServer({
    port:8080
})

ws.on("connection",(ws)=>{
    ws.on("error",console.error)

    ws.on("message",(data)=>{
        console.log("recieved",data)
    })

    ws.send("something")
})



