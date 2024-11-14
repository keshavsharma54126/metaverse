import { User } from "./user"
import { OutgoingMessage } from "./types"

export class RoomManager{
    rooms:Map<string,User[]>;
    static instance:RoomManager;

    private constructor(){
        this.rooms = new Map()
    }

    static getInstance(){
        if(!this.instance){
            this.instance = new RoomManager()
        }
        return this.instance
    }

    public addUser(spaceId:string,user:User){
        if(!this.rooms.has(spaceId)){
            this.rooms.set(spaceId,[user])
            return
        }
        this.rooms.get(spaceId)?.push(user)
    }
    public broadcase(message:OutgoingMessage,user:User,roomId:string){
        
    }




}