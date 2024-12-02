type WebSocketHandlers = {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onSpaceJoined?: (spawn: { x: number; y: number }, users: any[],userId:string) => void;
    onUserJoined?: (userId: string,id:string, position: { x: number; y: number }) => void;
    onUserLeft?: (userId: string) => void;
    onPositionUpdate?: (userId: string, id:string, position: { x: number; y: number }) => void;
    onMovementRejected?: (userId: string, x: number, y: number) => void;
    onEmote?: (userId: string, emote: string) => void;
    onError?: (error: any) => void;
  };

export class GameWebSocket {
    private ws: WebSocket | null = null;
    private handlers: WebSocketHandlers = {};
    private url: string;
    private debug: boolean;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    constructor(url: string, debug: boolean = false) {
        this.url = url;
        this.debug = debug;
    }

    public connect(spaceId: string, token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.log("Initiating connection...");
                this.ws = new WebSocket(this.url);
                
                this.ws.onopen = () => {
                    this.log("Connection opened, sending join message");
                    this.handlers.onConnect?.();
                    this.startHeartbeat();
                    
                    const joinMessage = {
                        type: "join",
                        spaceId,
                        token
                    };
                    
                    this.log("Sending join message:", joinMessage);
                    this.send(joinMessage);
                    
                    resolve();
                };

                this.ws.onclose = (event) => {
                    this.log(`Connection closed - Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
                    this.stopHeartbeat();
                    this.handlers.onDisconnect?.();
                    
                    if (!event.wasClean) {
                        this.attemptReconnect(spaceId, token);
                    }
                };

                this.ws.onerror = (error) => {
                    this.log("WebSocket error:", error);
                    this.handlers.onError?.(error);
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.log("Received message:", data);
                        this.handleMessage(event);
                    } catch (error) {
                        this.log("Error parsing message:", error);
                    }
                };

            } catch (error) {
                this.log("Connection error:", error);
                reject(error);
            }
        });
    }

    private startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.send({ type: "heartbeat" });
            }
        }, 15000); // Send heartbeat every 15 seconds
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private attemptReconnect(spaceId: string, token: string) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.log(`Attempting to reconnect... ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            setTimeout(() => {
                this.connect(spaceId, token).catch(console.error);
            }, 1000 * this.reconnectAttempts); // Exponential backoff
        }
    }

    public close() {
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    private handleMessage = (message:any)=>{
       try{
        const parsedData = JSON.parse(message.data)
        this.log(parsedData)
        switch(parsedData.type){
            case "space-joined":
                this.handlers.onSpaceJoined?.(
                    parsedData.payload.spawn,
                    parsedData.payload.users,
                    parsedData.payload.userId
                )
                break;
            
            case "user-joined":
                this.handlers.onUserJoined?.(
                    parsedData.payload.userId,
                    parsedData.payload.id,
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
                console.log("received movement update",parsedData.payload)
                this.handlers.onPositionUpdate?.(
                    parsedData.payload.userId,
                    parsedData.payload.id,
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

    public send(message: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.log("Sending message:", message);
            this.ws.send(JSON.stringify(message));
        } else {
            this.log("Cannot send message - WebSocket not open, state:", this.ws?.readyState);
        }
    }

    public setHandlers(handlers:WebSocketHandlers){
        this.handlers = {...this.handlers,...handlers}
    }

    private log(...args:any[]){
        if(this.debug){
            console.log(...args)
        }
    }

}