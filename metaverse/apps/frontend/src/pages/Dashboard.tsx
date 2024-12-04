import { useEffect, useState } from "react";
import { Users,  Settings, LogOut, Plus, Search, Star, Clock, Loader2} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DialogBox } from "../components/DialogBox";

type User = {
  id:string,
  username:string,
  avatarId:string,
  imageUrl:string,
}
type Avatar = {
  id:string,
  name:string,
  imageUrl:string
}

const Dashboard = () => {
  const [selectedSpace, setSelectedSpace] = useState(null);
  const[user,setUser] = useState<User|null>(null)
  const[avatar,setAvatar] = useState<Avatar|null>(null)
  const[avatars,setAvatars] = useState<Avatar[]>([])
  const[maps,setMaps] = useState([])
  const[spaces,setSpaces] = useState<any[]>([])
  const[isLoading,setIsLoading] = useState(true)
  const navigate = useNavigate()
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
    useEffect(()=>{
        if(!localStorage.getItem("authToken")){
            navigate("/signin")
        }
        const token = localStorage.getItem("authToken")
        const tokenPayload = token?.split(".")[1]
        const decodedToken = atob(tokenPayload || '')
        const userData = JSON.parse(decodedToken)
        const userId = userData.userId
       const fetchAvatar = async()=>{
        const res = await axios.get(`${BACKEND_URL}/user/metadata/${userId}`,{
          headers:{
            Authorization:`Bearer ${token}`,
            "Content-Type":"application/json"
          }
        })
        
        setUser(res.data.user)
        
       }
       fetchAvatar()
       const fetchAvatars = async()=>{
        const res = await axios.get(`${BACKEND_URL}/avatars`,{
          headers:{
            Authorization:`Bearer ${token}`,
            "Content-Type":"application/json"
          }
        })
       
        setAvatars(res.data.avatars)
      }
      const fetchMaps = async()=>{
        const res = await axios.get(`${BACKEND_URL}/user/maps`,{
          headers:{
            Authorization:`Bearer ${token}`,
            "Content-Type":"application/json"
          }
        })
        setMaps(res.data.maps)
      }
      const fetchSpaces = async()=>{
        try{
          const res = await axios.get(`${BACKEND_URL}/space/all/${userId}`,{
            headers:{
              Authorization:`Bearer ${token}`,
              "Content-Type":"application/json"
            }
          })
          setSpaces(res.data.spaces)
        }catch(err){
          console.log(err)
        }
      }
      Promise.all([fetchAvatar(),fetchAvatars(),fetchMaps(),fetchSpaces()]).then(()=>{
        setIsLoading(false)
      })
    },[])


  if(isLoading){
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-3xl font-bold">M</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-gray-400 animate-pulse">Hi <span className="font-bold">{user?.username}</span>,Loading your metaverse assets ...</p>
        </div>
      </div>
    );
  }
  if(!user?.avatarId){
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-8">Choose your avatar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-4xl">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              onClick={async () => {
                const token = localStorage.getItem("authToken");
                await axios.post(
                  `${BACKEND_URL}/user/metadata`,
                  { avatarId: avatar.id },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json"
                    }
                  }
                );
                setAvatar(avatar);
                window.location.reload()
              }}
              className="bg-gray-800 rounded-xl p-4 flex flex-col items-center hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent hover:border-violet-500"
            >
              <img 
                src={avatar.imageUrl} 
                alt={avatar.name} 
                className="w-20 h-20 object-cover rounded-lg mb-3" 
              />
              <span className="text-sm text-center">{avatar.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

else{
  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              MetaSpace
            </span>
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search spaces..."
                className="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <nav className="space-y-2">
            <button className="flex items-center gap-4 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-full transition-colors">
              <Users className="w-5 h-5" />
               My Spaces
            </button>
            <button className="flex items-center gap-4 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-full transition-colors">
              <Star className="w-5 h-5" />
              Favorites
            </button>
            <button className="flex items-center gap-4 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-full transition-colors">
              <Clock className="w-5 h-5" />
              Recent
            </button>
            <button className="flex items-center gap-4 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-full transition-colors">
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <button onClick={()=>{
                localStorage.removeItem("authToken")
                navigate("/")
            }} className="flex items-center gap-4 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg w-full transition-colors">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Hi <span className="font-bold text-violet-500">{user?.username.toUpperCase()}</span>,Welcome to your spaces</h1>
            <p className="text-gray-400 mt-2">Select a space to enter or create a new one</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <DialogBox maps={maps} userId={user?.id}/>
          </button>
        </header>

        {/* Spaces Grid */}
        <div className="flex flex-col items-center justify-center gap-4">
          {spaces.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="bg-gray-900 rounded-xl p-8 text-center max-w-lg border border-gray-800">
                <div className="mb-6">
                  <Plus className="w-12 h-12 text-violet-500 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Spaces Found</h3>
                <p className="text-gray-400 mb-6">
                  Get started by creating your first virtual space. Click the "Create New Space" button above to begin your metaverse journey.
                </p>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 mx-auto"
                  onClick={() => {/* Add your create space handler here */}}
                >
                  <Plus className="w-5 h-5" />
                  <DialogBox maps={maps} userId={user?.id}/>
                </button>
              </div>
            </div>
          )}
       </div>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {spaces?.map((space) => (
            <div
              key={space.id}
              className={`group cursor-pointer overflow-hidden rounded-xl bg-gray-900 border border-gray-800 transition-all hover:border-violet-500 ${
                selectedSpace === space.id ? "ring-2 ring-violet-500" : ""
              }`}
              onClick={() => {
                setSelectedSpace(space.id)
                navigate(`/space/${space.id}`)
              }}
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-800 overflow-hidden">
                <img
                  src={space.thumbnail}
                  alt={space.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  {space.favorite && (
                    <div className="bg-gray-900/80 p-2 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                  <div className="bg-gray-900/80 p-2 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold">{space.name}</h2>
                  <span className="text-sm text-gray-400">{space.participants}/{space.capacity}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{space.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last visited: {space.lastVisited}</span>
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition"
                    onClick={async(e) => {
                     try{
                      e.stopPropagation();
                      const token = localStorage.getItem("authToken")
                      await axios.delete(`${BACKEND_URL}/space/${space.id}`,{
                        headers:{
                          Authorization:`Bearer ${token}`,
                          "Content-Type":"application/json"
                        }
                      })
                      window.location.reload()
                     }catch(err){
                      console.error(err,"errro while deleting space")
                     }
                    }}
                  >
                    Delete Space
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Space Details */}
        {selectedSpace && (
          <div className="mt-12 bg-gray-900 p-8 rounded-xl border border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {spaces.find((space) => space.id === selectedSpace)?.name}
                </h2>
                <p className="text-gray-400 mt-2">
                  {spaces.find((space) => space.id === selectedSpace)?.description}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition">
                  Enter Space
                </button>
                <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
                  Invite Others
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Active Participants</h3>
                <p className="text-2xl text-violet-400">
                  {spaces.find((space) => space.id === selectedSpace)?.participants}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Total Capacity</h3>
                <p className="text-2xl text-violet-400">
                  {spaces.find((space) => space.id === selectedSpace)?.capacity}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Last Activity</h3>
                <p className="text-2xl text-violet-400">
                  {spaces.find((space) => space.id === selectedSpace)?.lastVisited}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
   
    };


export default Dashboard;

