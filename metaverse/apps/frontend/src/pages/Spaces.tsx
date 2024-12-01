import { useNavigate, useParams } from 'react-router-dom';
import SpaceComponent from '../components/space';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import { Space, Element } from '../components/space';
import { GameWebSocket } from '../websocket';
interface Participant{
    id:string;
    name:string;
    avatar:string;
    position:{x:number,y:number}
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
    const [isConnected,setIsConnected] = useState(false);
    const [currentUser,setCurrentUser] = useState<any>({})
    const [participants,setParticipants] = useState<Participant[]>([]);
    const wsRef = useRef<GameWebSocket|null>(null);
    const wsUrl = import.meta.env.VITE_WS_URL;
    useEffect(() => {
        const fetchSpace = async () => {
            if (!id) return;
            try {
                const res = await axios.get(`${BACKEND_URL}/space/${id}`);
                setSpace(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        
        fetchSpace().finally(() => {
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
            onSpaceJoined:async(spawn,users,userId)=>{
                setParticipants(users)
                setCurrentUser({id:users[0].id,name:users[0].name,avatar:users[0].avatar,position:spawn})
                //handle current user name and avatar
                const {name,avatar} = await handleUserUpdata(userId)
                setCurrentUser({...currentUser,name,avatar})
            },
            onUserJoined:async(id,userId,position)=>{
                const {name,avatar} = await handleUserUpdata(userId)
                setParticipants((prev)=>[...prev,{id,userId,name,avatar,position}])
            },
            onUserLeft:(userId)=>{
                setParticipants((prev)=>prev.filter((user)=>user.id!==userId))
            },
            onPositionUpdate:(userId,position)=>{
                setParticipants((prev)=>prev.map((user)=>user.id===userId?{...user,position}:user))
            },
            onMovementRejected:(userId,x,y)=>{
                console.log("movement rejected",userId,x,y)
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
        return {name:res.data.user.name,avatar:res.data.user.avatar?.imageUrl}
    }



    if(loading) return <div className='flex justify-center items-center h-screen'><Loader/></div>

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            {/* Main Game Viewport */}
            <div className="flex-1 relative">
                {/* Game Canvas */}
                <div className="absolute inset-0 overflow-hidden rounded-lg shadow-lg ">
                    {space && <SpaceComponent space={space} currentUser={currentUser} participants={participants} wsRef={wsRef}/>}
                </div>

                {/* Chat overlay - now with glass morphism effect */}
                <div onClick={()=>setChatOpen(true)} className={`absolute top-14 right-0 w-[25rem] ${isChatOpen ? 'h-[calc(100vh-8rem)]' : 'h-[4rem]'} bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg text-white rounded-lg shadow-lg flex flex-col overflow-hidden`}>
                    <div className="p-4 border-b border-gray-600 flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Chat</h2>
                        <button className="text-gray-400 hover:text-white transition-colors" onClick={(e)=>{
                            e.stopPropagation();
                            setChatOpen(!isChatOpen)
                        }}>
                            {isChatOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {/* Chat messages will go here */}
                    </div>
                    <div className="p-4 border-t border-gray-600">
                        <div className="flex items-center bg-gray-700 rounded-full overflow-hidden">
                            <input 
                                type="text" 
                                placeholder="Type a message..."
                                className="w-full bg-transparent text-white px-4 py-2 focus:outline-none"
                            />
                            <button className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Updated Bottom Control Bar */}
            <div className="h-20 bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg text-white px-6 flex items-center justify-between border-t border-gray-700">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                        <img 
                            src={space?.thumbnail} 
                            alt={space?.name} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                        />
                        <div>
                            <h1 className="text-xl font-bold">{space?.name}</h1>
                            <p className="text-sm text-gray-400">{space?.description}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-3 rounded-full transition-all ${
                            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMuted ? "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" : "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"} />
                        </svg>
                    </button>
                    <button 
                        onClick={() => setCameraOff(!isCameraOff)}
                        className={`p-3 rounded-full transition-all ${
                            isCameraOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCameraOff ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                        </svg>
                    </button>
                    <button 
                        onClick={() => setScreenSharing(!isScreenSharing)}
                        className={`p-3 rounded-full transition-all ${
                            isScreenSharing ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <div className="h-8 w-px bg-gray-600"></div>
                    <div className="flex -space-x-2 overflow-hidden">
                        {participants.map((participant) => (
                            <img
                                key={participant.id}
                                src={participant.avatar}
                                alt={participant.name}
                                className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                                title={participant.name}
                            />
                        ))}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 ring-2 ring-white text-sm font-medium">
                            +3
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-600"></div>
                    <button onClick={() => {
                        navigate('/Dashboard')
                    }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        <span>Leave Space</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Spaces;

