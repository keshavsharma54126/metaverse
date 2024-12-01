import WebSocket from "ws";

type WebSocketHandlers = {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onSpaceJoined?: (spawn: { x: number; y: number }, users: any[]) => void;
    onUserJoined?: (userId: string, position: { x: number; y: number }) => void;
    onUserLeft?: (userId: string) => void;
    onPositionUpdate?: (userId: string, position: { x: number; y: number }) => void;
    onMovementRejected?: (userId: string, x: number, y: number) => void;
    onEmote?: (userId: string, emote: string) => void;
    onError?: (error: any) => void;
  };

export class GameWebSocket {
    private ws:WebSocket |null = null;
    private handlers:WebSocketHandlers = {};
    private url:string;
    private debug:boolean;
    private reconnectionAttemps:number = 0;
    private maxReconnectionAttemps:number = 5;

    constructor(url:string,debug:boolean=false){
        this.url = url;
        this.debug=debug;
    }

    public connect(spaceId:string,token:string):Promise<void>{
        this.reconnectionAttemps=0;
        return new Promise((resolve,reject)=>{
           try{
            this.ws = new WebSocket(this.url);
            this.ws.onopen = ()=>{
                this.reconnectionAttemps=0;
                this.log("connected to server")
                this.handlers.onConnect?.();
                this.send({
                    type:"join",
                    spaceId,
                    token
                })
                resolve()
            }
            this.ws.onclose = ()=>{
                this.log("disconnected from server")
                this.handlers.onDisconnect?.();
                this.handleReconnection(spaceId,token)
            }
            this.ws.onerror= (error)=>{
                this.log("error while connecting to server")
                this.handlers.onError?.(error)
                reject(error)
            }

            this.ws.onmessage = (message:any)=>{
                this.handleMessage(message)
            }
           }catch(e){
            this.handlers.onError?.(e)
            reject(e)
           }
        })
    }


    private handleMessage = (message:any)=>{
       try{
        const parsedData = JSON.parse(message.data)
        this.log(parsedData)
        switch(parsedData.type){
            case "space-joined":
                this.handlers.onSpaceJoined?.(
                    parsedData.payload.spawn,
                    parsedData.payload.users
                )
                break;
            
            case "user-joined":
                this.handlers.onUserJoined?.(
                    parsedData.payload.userId,
                    {
                        x:parsedData.payload.x,
                        y:parsedData.payload.y
                    }
                )
                break;
            
            case "user-left":
                this.handlers.onUserLeft?.(
                    parsedData.payload.userId
                )
                break;

            case "movement":
                this.handlers.onPositionUpdate?.(
                    parsedData.payload.userId,
                    {
                        x:parsedData.payload.x,
                        y:parsedData.payload.y
                    }

                )
                break;
            
            case "movement-rejected":
                this.handlers.onMovementRejected?.(
                    parsedData.payload.userId,
                    parsedData.payload.x,
                    parsedData.payload.y
                )
                break;

            case "emote":
                this.handlers.onEmote?.(
                    parsedData.payload.userId,
                    parsedData.payload.emote
                )
                break;

            default:
                this.log("unknown message type",parsedData.type)
        }
       }catch(e){
        this.handlers.onError?.(e)
        this.log("error while parsing message",e)
       }

    }

    public send(data:any){
        if(!this.ws || this.ws.readyState!==WebSocket.OPEN) return;
        this.ws.send(JSON.stringify(data))
    }
    private handleReconnection(spaceId:string,token:string){
        if(this.reconnectionAttemps<this.maxReconnectionAttemps){
           this.reconnectionAttemps++;
           setTimeout(()=>{
            this.log(`attempting to reconnect... ${this.reconnectionAttemps}/${this.maxReconnectionAttemps}`)
            this.connect(spaceId,token)
           },5000)
            
        }
    }

    public setHandlers(handlers:WebSocketHandlers){
        this.handlers = {...this.handlers,...handlers}
    }

    public close(){
        if(this.ws){
            this.ws.close()
            this.ws = null;
        }
    }
    private log(...args:any[]){
        if(this.debug){
            console.log(...args)
        }
    }

}