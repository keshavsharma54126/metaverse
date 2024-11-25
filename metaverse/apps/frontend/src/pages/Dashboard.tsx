import { useEffect, useState } from "react";
import { Users,  Settings, LogOut, Plus, Search, Star, Clock} from "lucide-react";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
  const [selectedSpace, setSelectedSpace] = useState(null);
    const navigate = useNavigate()

    useEffect(()=>{
        if(!localStorage.getItem("authToken")){
            navigate("/signin")
        }
    },[])

  const spaces = [
    {
      id: 1,
      name: "Tech Hub Campus",
      description: "A virtual tech campus with meeting rooms, coffee shops, and collaboration zones",
      thumbnail:"https://storage.icograms.com/templates/preview/traditional-complex.png",
      participants: 12,
      capacity: 50,
      favorite: true,
      lastVisited: "2 hours ago"
    },
    {
      id: 2,
      name: "Zen Garden Office",
      description: "Peaceful workspace with meditation areas and quiet zones",
      thumbnail:"https://i.ytimg.com/vi/JePchzu_USM/maxresdefault.jpg",
      participants: 8,
      capacity: 30,
      favorite: false,
      lastVisited: "1 day ago"
    },
    {
      id: 3,
      name: "Gaming Arena",
      description: "Multiple gaming zones with arcade machines and party games",
      thumbnail:"https://cdn.prod.website-files.com/640f99c52b298c7753381c38/64227fef3607a78fb7af2ca7_6180810f2fc8a74097527122_team.png",
      participants: 15,
      capacity: 40,
      favorite: true,
      lastVisited: "3 hours ago"
    },
    {
      id: 4,
      name: "Creative Studio",
      description: "Art galleries, brainstorming rooms, and creative workshops",
      thumbnail:"https://cdn.prod.website-files.com/640f99c52b298c7753381c38/671bb72e8e9a8737cf2cf456_CTO-Labs-Feature-Card-2x.png",
      participants: 7,
      capacity: 25,
      favorite: false,
      lastVisited: "5 days ago"
    }
  ];


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
                <h1 className="text-3xl font-bold">My Spaces</h1>
                <p className="text-gray-400 mt-2">Select a space to enter or create a new one</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Space
              </button>
            </header>
    
            {/* Spaces Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((space) => (
                <div
                  key={space.id}
                  className={`group cursor-pointer overflow-hidden rounded-xl bg-gray-900 border border-gray-800 transition-all hover:border-violet-500 ${
                    selectedSpace === space.id ? "ring-2 ring-violet-500" : ""
                  }`}
                  onClick={() => {
                    setSelectedSpace(space.id)
                    navigate(`/world`)
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
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Entering ${space.name}`);
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
    };


export default Dashboard;