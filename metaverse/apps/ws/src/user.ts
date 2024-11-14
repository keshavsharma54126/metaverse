import { WebSocket } from "ws"
import { OutgoingMessage } from "./types"
import { RoomManager } from "./RoomManager"

function getRandomId(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export class User{
    private ws:WebSocket
    private id:string
     constructor(ws:WebSocket){
        this.ws = ws
        this.id = getRandomId()
    }

    initHandler(){
        this.ws.on("message",(data)=>{
            const parsedData = JSON.parse(data.toString())
            switch(parsedData.type){
                case "join":
                  const spaceId = parsedData.spaceId;
                  RoomManager.getInstance().addUser(spaceId,this)
                  this.send({
                    type:"space-joined",
                    payload:{
                        //chedk the notion doc here we need tos end the spaw points so get back to this later for static objects checking
                        spawn:{
                           x:Math.floor(Math.random()*100),
                           y:Math.floor(Math.random()*100), 
                        },
                        users: RoomManager.getInstance().rooms.get(spaceId)?.map((u) => ({id: u.id})) ?? []
                    }
                  })
                  
            }

        })
    }

    send(payload:OutgoingMessage){
        this.ws.send(JSON.stringify(payload))
    }


}