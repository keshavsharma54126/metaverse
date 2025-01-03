import { useNavigate, useParams } from 'react-router-dom';
import SpaceComponent from '../components/space';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import { Space } from '../components/space';
import { GameWebSocket } from '../websocket';
import { jwtDecode } from "jwt-decode";
interface Participant{
    id:string;
    userId:string;
    name:string;
    avatarId:string;
    url:string;
    position:{x:number,y:number}
}

interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: Date;
    avatarUrl?: string;
}

const Spaces = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [space, setSpace] = useState<Space|null>(null);
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setCameraOff] = useState(false);
    const [isScreenSharing, setScreenSharing] = useState(false);
    const [isChatOpen, setChatOpen] = useState(true);
    //@ts-ignore
    const [isConnected,setIsConnected] = useState(false);
    const [currentUser,setCurrentUser] = useState<any>({})
    const [participants,setParticipants] = useState<Participant[]>([]);
    const wsRef = useRef<GameWebSocket|null>(null);
    const wsUrl = import.meta.env.VITE_WS_URL;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isChatFocused, setIsChatFocused] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken") as string;
        if(!token) return navigate("/signin");
        const fetchSpace = async () => {
            if (!id) return;
            try {
                const res = await axios.get(`${BACKEND_URL}/space/${id}`);
                setSpace(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        const fetchMessages = async()=>{
            const token = localStorage.getItem("authToken") as string;
            const res = await axios.get(`${BACKEND_URL}/space/messages/${id}`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("messages",res.data.messages)
            setMessages(res.data.messages.map((message:any)=>({
                ...message,
                avatarUrl:message.user.avatar.imageUrl,
                userName:message.user.username,
                userId:message.user.id,
                message:message.content,
                id:message.id,
                timestamp:new Date(message.createdAt),
            })));
        }
        Promise.all([fetchSpace(),fetchMessages()]).finally(()=>{
            setLoading(false);
        });
    }, [id, BACKEND_URL]);

    useEffect(()=>{
        wsRef.current = new GameWebSocket(wsUrl, true);
        wsRef.current.setHandlers({
            onConnect: () => {
                console.log("connected to ws");
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log("disconnected from ws");
                setIsConnected(false);
            },
            onError: (error) => {
                console.error("WebSocket error:", error);
                setIsConnected(false);
            },
            onSpaceJoined: async (spawn, users, userId) => {
                const updatedUsers = await Promise.all(users.map(async (user) => {
                    const { name, avatarId, url } = await handleUserUpdata(user.userId);
                    return {
                        id: user.id,
                        userId: user.userId,
                        name,
                        avatarId,
                        url,
                        position: user.position
                    };
                }));
                
                setParticipants(updatedUsers);
                const {name, avatarId, url} = await handleUserUpdata(userId);
                setCurrentUser({
                    id: users[0].id,
                    userId: userId,
                    name,
                    avatarId,
                    url,
                    spawn: {x: spawn.x, y: spawn.y}
                });
            },
            onUserJoined:async(userId,id,x,y)=>{
                console.log("=== User Joined Event ===")
                console.log("Initial params:", {userId,id,x,y})
                try{
                    const {name,avatarId,url} = await handleUserUpdata(userId)
                    console.log("User metadata:", {name,avatarId,url})
                    
                    const newParticipant = {
                        id,
                        userId,
                        name,
                        avatarId,
                        url,
                        position: {x,y}
                    }
                    console.log("New participant object:", newParticipant)
                    
                    setParticipants((prev)=>{
                        console.log("Previous participants:", prev)
                        const updated = [...prev, newParticipant]
                        console.log("Updated participants:", updated)
                        return updated
                    })
                    
                }catch(err){
                    console.error("Error in user joined:", err)
                }
            },
            onUserLeft:(userId)=>{
                setParticipants((prev)=>prev.filter((user)=>user.id!==userId))
            },
            onPositionUpdate:(userId:string, id:string,x:number, y:number)=>{
                console.log("position update",userId,id,x,y)
                setParticipants((prev)=>prev.map((user)=>user.id===id?{
                    ...user,
                    userId,
                    x,
                    y
                }:user))
            },
            onMovementRejected:(userId,x,y)=>{
                console.log("movement rejected",userId,x,y)
            },
            onMessage:(userId:string,id:string,message:string,userName:string,url:string,timestamp:Date)=>{
                console.log("chatmessage",userId,id,message,userName,url,timestamp)
                setMessages((prev)=>[...prev,{
                    id,
                    userId,
                    userName,
                    message,
                    avatarUrl:url,
                    timestamp
                }])
            }


        })

        const token = localStorage.getItem("authToken");
        if (token && id) {
            wsRef.current.connect(id, token)
                .catch((error) => {
                    console.error("Failed to connect:", error);
                    setIsConnected(false);
                });
        }

        return () => {
            wsRef.current?.close();
        };
    }, [id, wsUrl]);

    const handleUserUpdata = async (userId:string)=>{
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${BACKEND_URL}/user/metadata/${userId}`,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        console.log("res",res.data)
        return {name:res.data.user.username,avatarId:res.data.user.avatar?.id,url:res.data.user.avatar?.imageUrl}
    }

    const handleSendMessage = async() => {
        if (!messageInput.trim()) return;
        
        const newMessage: ChatMessage = {
            id: crypto.randomUUID(),
            userId: currentUser.userId,
            userName: currentUser.name,
            message: messageInput,
            timestamp: new Date(),
            avatarUrl: currentUser.url
        };
        
        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');
        
        // Scroll to bottom of chat
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 100);
        
        // TODO: Send message through websocket
        
        wsRef.current?.send({
            type:"chat message",
            payload:{
                userId:currentUser.userId,
                id:newMessage.id,
                userName:currentUser.name,
                avatarUrl:currentUser.url,
                message:newMessage.message,
                timestamp:newMessage.timestamp
            }
        })
        const token = localStorage.getItem("authToken") as string;
        const decoded  = jwtDecode(token) as any
        await axios.post(`${BACKEND_URL}/space/message`,{
            userId: decoded.userId,
            id: newMessage.id,
            message: newMessage.message,
            spaceId:id,
        },{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
    };

    // Add click event listener to the document
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                inputRef.current.blur();
            }
        };

        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, []);

    if(loading) return <div className='flex justify-center items-center h-screen'><Loader/></div>

    if (space?.status === "Inactive") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-900">
                <div className="p-8 bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-violet-500/20 shadow-[0_0_100px_rgba(139,92,246,0.15)] text-center max-w-md mx-4">
                    <div className="mb-6">
                        <svg 
                            className="w-16 h-16 mx-auto text-violet-500 animate-pulse" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">Session Ended</h1>
                    <p className="text-gray-400 mb-6">
                        This space is currently inactive. The session may have ended or been temporarily suspended.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                        <button 
                            onClick={() => navigate('/Dashboard')} 
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (

        <div className="flex flex-col h-screen w-screen bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-900">


            {/* Main Game Viewport */}
            <div className="flex-1 relative p-6">
                {/* Game Canvas with enhanced effects */}
                <div className="absolute w-scren inset-0 overflow-hidden rounded-3xl shadow-[0_0_100px_rgba(139,92,246,0.15)] border border-violet-500/20 backdrop-blur-sm">
                    {space && <SpaceComponent space={space} currentUser={currentUser} participants={participants} wsRef={wsRef} isChatFocused={isChatFocused}/>}
                </div>

                {/* Enhanced Chat overlay with glass morphism */}
                <div 
                    onClick={()=>setChatOpen(true)} 
                    className={`absolute top-0 right-6 w-[28rem] transition-all duration-500 ease-out transform 
                        ${isChatOpen ? 'h-[calc(100vh-9rem)]' : 'h-[4rem] hover:scale-[1.02] cursor-pointer'} 
                        bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl text-white rounded-3xl 
                        shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10
                        flex flex-col`}
                >
                    <div className="p-5 border-b border-white/10 flex justify-between items-center shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <h2 className="font-semibold text-lg bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Live Chat</h2>
                        </div>
                        <button 
                            className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200" 
                            onClick={(e)=>{
                                e.stopPropagation();
                                setChatOpen(!isChatOpen)
                            }}
                        >
                            {isChatOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                </svg>
                            )}
                        </button>
                    </div>


                   

                    {/* Chat input - now inside the container */}
                    {isChatOpen && (
                        <div className="flex flex-col h-full ">
                            {/* Chat messages container with max height */}
                            <div 
                                ref={chatContainerRef}
                                className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4"
                            >
                                {messages.map((msg) => msg.message && (
                                    <div 
                                        key={msg.id}
                                        className={`flex items-start gap-3 ${
                                            msg.userId === currentUser.userId ? 'flex-row-reverse' : ''
                                        }`}
                                    >
                                        <img 
                                            src={msg.avatarUrl} 
                                            alt={msg.userName}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className={`flex flex-col ${
                                            msg.userId === currentUser.userId ? 'items-end' : ''
                                        }`}>
                                            <span className="text-sm text-gray-400">{msg.userName}</span>
                                            <div className={`mt-1 px-4 py-2 rounded-xl max-w-[80%] ${
                                                msg.userId === currentUser.userId
                                                    ? 'bg-violet-600 text-white rounded-tr-none'
                                                    : 'bg-gray-700 text-white rounded-tl-none'
                                            }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Input container with sticky positioning */}
                            <div className="p-8 border-t border-white/10 bg-gray-900/90 backdrop-blur-xl">
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text" 
                                            value={messageInput}
                                            onChange={(e) => {
                                                if (!isChatFocused) return;
                                                e.stopPropagation();
                                                setMessageInput(e.target.value);
                                            }}
                                            onKeyDown={(e) => {
                                                if (!isChatFocused) return;
                                                e.stopPropagation();
                                                e.nativeEvent.stopImmediatePropagation();
                                                
                                                if (e.key === 'Enter') {
                                                    handleSendMessage();
                                                }
                                            }}
                                            onFocus={() => {
                                               setIsChatFocused(true)
                                            }}
                                            onBlur={() => {
                                               setIsChatFocused(false)
                                            }}
                                            placeholder="Type your message..."
                                            className="w-full bg-white/5 text-white px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-gray-400
                                                transition-all duration-300 border border-white/5 hover:border-white/10"
                                            ref={inputRef}
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                <svg className="w-5 h-5 text-gray-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                <svg className="w-5 h-5 text-gray-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleSendMessage}
                                        className="bg-violet-600 p-4 rounded-xl hover:bg-violet-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Control Bar */}
            <div className="h-24 bg-gray-900/95 backdrop-blur-2xl text-white px-8 flex items-center justify-between border-t border-white/5
                shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-4 group">
                        <div className="relative">
                            <img 
                                src={space?.thumbnail} 
                                alt={space?.name} 
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500/50 group-hover:border-violet-400 
                                    transition-all duration-300 transform group-hover:scale-105 shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{space?.name}</h1>
                            <p className="text-sm text-gray-400 mt-1">{space?.description}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Control buttons with hover effects */}
                    <div className="flex items-center space-x-4 bg-white/5 rounded-2xl p-2">
                        <ControlButton
                            active={!isMuted}
                            onClick={() => setIsMuted(!isMuted)}
                            icon="microphone"
                        />
                        <ControlButton
                            active={!isCameraOff}
                            onClick={() => setCameraOff(!isCameraOff)}
                            icon="camera"
                        />
                        <ControlButton
                            active={isScreenSharing}
                            onClick={() => setScreenSharing(!isScreenSharing)}
                            icon="screen"
                        />
                    </div>

                    {/* Participants */}
                    <div className="flex -space-x-4">
                        {participants.map((participant, index) => (
                            <div key={participant.id} className="relative group" style={{ zIndex: participants.length - index }}>
                                <img
                                    src={participant.url}
                                    alt={participant.name}
                                    className="w-12 h-12 rounded-full border-4 border-gray-900 transition-transform duration-200 
                                        hover:scale-110 hover:z-50 cursor-pointer"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 
                                    text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                    {participant.name}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Leave button */}
                    <button 
                        onClick={() => navigate('/Dashboard')} 
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 
                            rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 
                            flex items-center space-x-2 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Leave Space</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ControlButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: string }) => {
    const getIcon = () => {
        switch(icon) {
            case 'microphone':
                return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>;
            case 'camera':
                return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>;
            case 'screen':
                return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>;
        }
    };

    return (
        <button 
            onClick={onClick}
            className={`p-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                active ? 'bg-violet-600 hover:bg-violet-700' : 'bg-red-500/90 hover:bg-red-600'
            } shadow-lg hover:shadow-xl`}
        >
            {getIcon()}
        </button>
    );
};

export default Spaces;


