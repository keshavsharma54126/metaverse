import { useEffect, useState } from 'react';
import { Plus, Search, Star, Clock, Settings, LogOut, Map, Menu, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Switch } from '../components/Switch';
import { Label } from '../components/Label';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

type Avatar={
  id:number,
  imageUrl:string,
  name:string,
}
type Element={
  id:number,
  imageUrl:string,
  name:string,
  width:number,
  height:number,
  static:boolean
}
type Map = {
  id: number;
  thumbnail: string;
  name: string;
  width:number,
  height:number,
  users: number;
  elements:Element[];
}


const AdminDashboard = () => {

  const navigate = useNavigate()
  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL;
  const [avatarName,setAvatarName]=useState("");
  const [avatarImageUrl,setAvatarImageUrl]=useState("")
  const [editAvatar,setEditAvatar] = useState<Avatar| null>()
  const[elementName,setElementName]=useState("")
  const [elementImageUrl,setElementImageUrl]=useState("")
  const [elementWidth,setElementWidth]=useState(0)
  const [elementHeight,setElementHeight]=useState(0)
  const [elementStatic,setElementStatic]=useState(true)
  const [editElement,setEditElement]=useState<Element|null>()
  const [elements, setElements] = useState<Element[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  
  const [maps, setMaps] = useState<Map[]>([]);
  const [editMap, setEditMap] = useState<Map | null>(null);
  const [mapName, setMapName] = useState("");
  const [mapThumbnail, setMapThumbnail] = useState("");
  const [mapDimensions, setMapDimensions] = useState("");

  const [searchElement,setSearchElement]=useState("")
  const [searchAvatar,setSearchAvatar]=useState("")
  const [searchMap,setSearchMap]=useState("")
  const [loading,setLoading]=useState(true)
 


  useEffect(()=>{
    updateAvatars()
    updateElements()
    updateMaps()
    setLoading(false)
  },[])




  const updateAvatars= async()=>{
    try{
      const token = localStorage.getItem("authToken")
      const res = await axios.get(`${BACKEND_URL}/admin/avatars`,{
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      console.log(res.data.avatars)
      setAvatars(res.data.avatars)

    }catch(e){
      console.error(e,"could not retrieve data of avataras")
    }
  }
  const handleCreateAvatar = async() => {
   try{
    const token = localStorage.getItem("authToken")
    console.log(token)
    if (avatarName && avatarImageUrl) {
      const res = await axios.post(`${BACKEND_URL}/admin/avatar`,{
        imageUrl:avatarImageUrl,
        name:avatarName
      },{
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      console.log(res.data)
      setAvatarName("")
      setAvatarImageUrl("")
      updateAvatars()
      toast.success("Avatar created successfully!");
    }
   }catch(e){
     console.error(e,"error while adding avatar")
     toast.error("Error while adding avatar.");
   }
  };
  const handleDeleteAvatar= async(id:number)=>{
    try{
      const token = localStorage.getItem("authToken")
       await axios.delete(`${BACKEND_URL}/admin/avatar/${id}`,{
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      updateAvatars()
    }catch(e){
      console.error(e,"error while deleting avatar")
    }
  }

  const handleUpdateAvatar = async(avatar:Avatar)=>{
    try{
      setAvatarName(avatar.name)
      const token = localStorage.getItem("authToken")
      const res= await axios.put(`${BACKEND_URL}/admin/avatar/${avatar.id}`,{
        avatarImageUrl,
        avatarName
      },{
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      console.log(res.data)
      setEditAvatar(null)
      setAvatarName("")
      setAvatarImageUrl("")
      updateAvatars()
    }catch(e){
      console.error(e,"error while deleting avatar")
    }
  }

  const updateElements = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${BACKEND_URL}/admin/elements`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      console.log(res.data.elements);
      setElements(res.data.elements);
    } catch (e) {
      console.error(e, "could not retrieve data of elements");
    }
  };

  const handleCreateElement = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (elementName && elementHeight && elementHeight && elementImageUrl) {
        const res = await axios.post(`${BACKEND_URL}/admin/element`, {
          name:elementName,
          imageUrl: elementImageUrl,
          width: elementWidth,
          height: elementHeight,
          static: elementStatic
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        console.log(res.data);
        setElementName("")
        setElementImageUrl("")
        setElementWidth(0)
        setElementHeight(0)
        setElementStatic(true)
        updateElements();
        toast.success("Element created successfully!");
      }
    } catch (e) {
      console.error(e, "error while adding element");
      toast.error("Error while adding element.");
    }
  };

  const handleUpdateElement = async (element: Element) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(`${BACKEND_URL}/admin/element/${element.id}`, {
        name:elementName,
        imageUrl: elementImageUrl,
        width: elementWidth,
        height: elementHeight,
        static: elementStatic
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      console.log(res.data);
      setEditElement(null)
      setElementName("")
      setElementImageUrl("")
      setElementWidth(0)
      setElementHeight(0)
      setElementStatic(true)
      updateElements();
    } catch (e) {
      console.error(e, "error while updating element");
    }
  };

  const handleDeleteElement = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${BACKEND_URL}/admin/element/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      updateElements();
    } catch (e) {
      console.error(e, "error while deleting element");
    }
  };

  const updateMaps = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${BACKEND_URL}/admin/maps`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      setMaps(res.data.maps);
    } catch (e) {
      console.error(e, "could not retrieve maps");
    }
  };

  const handleCreateMap = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (mapName && mapThumbnail && mapDimensions) {
        const res = await axios.post(`${BACKEND_URL}/admin/map`, {
          name: mapName,
          thumbnail: mapThumbnail,
          dimensions: mapDimensions,
  
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        console.log(res.data)
        setMapName("");
        setMapThumbnail("");
        setMapDimensions("");
        updateMaps();
        toast.success("Map created successfully!");
      }
    } catch (e) {
      console.error(e, "error while adding map");
      toast.error("Error while adding map.");
    }
  };

  const handleUpdateMap = async (map: Map) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(`${BACKEND_URL}/admin/map/${map.id}`, {
        name: mapName,
        thumbnail: mapThumbnail,
        dimensions: mapDimensions,
       
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      console.log(res.data)
      setEditMap(null);
      setMapName("");
      setMapThumbnail("");
      setMapDimensions("");
     
      updateMaps();
    } catch (e) {
      console.error(e, "error while updating map");
    }
  };

  const handleDeleteMap = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${BACKEND_URL}/admin/map/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      updateMaps();
    } catch (e) {
      console.error(e, "error while deleting map");
    }
  };

  const handleLogout = ()=>{
    try{
      localStorage.removeItem("authToken")
      navigate("/adminSignin")
    }catch(e){
      console.error(e,"error while logging out")
    }
  }

  const filteredElemens = elements.filter(element => element.name.toLowerCase().includes(searchElement.toLowerCase()))
  const filteredAvatars = avatars.filter(avatar => avatar.name.toLowerCase().includes(searchAvatar.toLowerCase()))
  const filteredMaps = maps.filter(map => map.name.toLowerCase().includes(searchMap.toLowerCase()))

  if(loading){
    return <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
    </div>
  }
  else{
    
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0a0a0c]">
      {/* Sidebar - slightly lighter than main background */}

      
      <div className="w-full md:w-72 bg-[#151518] p-6 border-b md:border-r border-gray-800/50 shadow-xl">
   
        <div className="flex items-center justify-between md:justify-start space-x-3 mb-8">
          <div className="flex items-center space-x-3">
          
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">MetaSpace</span>
          </div>
        </div>

        
        <div>
          
        <div className="flex md:block overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-2">
          {[
            { icon: Map, label: 'Manage Spaces' },
            { icon: Star, label: 'Featured' },
            { icon: Clock, label: 'Recent' },
            { icon: Settings, label: 'Settings' },
            { icon: LogOut, label: 'Logout', onClick: handleLogout }
          ].map((item) => (
            <Button
              key={item.label}
              onClick={item.onClick}
              variant="ghost"
              className="min-w-[120px] md:w-full justify-start text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 rounded-lg"
            >
              <item.icon className="mr-3 h-4 w-4" />
              <span className="hidden md:inline font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
        </div>
      </div>

      {/* Main Content - Enhanced with better spacing and gradients */}
      <div className="flex-1 p-6 md:p-8 overflow-auto bg-[#0a0a0c]">
        <h1 className="text-3xl font-bold text-gray-100 mb-8 tracking-tight">Admin Dashboard</h1>
        
        <Tabs defaultValue="elements" className="w-full">
          <TabsList className="bg-[#151518] border border-gray-800/50 rounded-xl p-1 overflow-x-auto flex-nowrap mb-6">
            {['elements', 'avatars', 'maps'].map((tab) => (
              <TabsTrigger 
                key={tab}
                value={tab} 
                className="px-6 py-3 text-base text-gray-400 data-[state=active]:text-gray-100 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600/80 data-[state=active]:to-indigo-600/80"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Update the cards with enhanced styling */}
          <TabsContent value="elements" className="mt-6">
            <div className="relative mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  className="w-1/3 bg-[#151518] text-gray-200 pl-10 border-gray-800 focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Search for elements..."
                  value={searchElement}
                  onChange={(e)=>{
                    setSearchElement(e.target.value)
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Element Card */}
              
              <div className="group bg-[#151518] hover:bg-[#1a1a1f] rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-500 shadow-lg hover:shadow-purple-500/10">
                <h3 className="text-xl font-bold text-gray-100 mb-6 tracking-tight">Add New Element</h3>
                <div className="space-y-4">
                <div>
                    <Label className="text-gray-300 mb-1.5">Element Name</Label>
                    <Input
                      className="bg-[#0a0a0c] border-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500/50"
                      value={elementName}
                      onChange={(e) => setElementName(e.target.value)}
                      placeholder="Office Desk"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-1.5">Image URL</Label>
                    <Input
                      className="bg-[#0a0a0c] border-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500/50"
                      value={elementImageUrl}
                      onChange={(e) => setElementImageUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    
                      <div key="Width">
                        <Label className="text-gray-300 mb-1.5">Width</Label>
                        <Input
                          type="number"
                          className="bg-[#0a0a0c] border-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500/50"
                          value={elementWidth}
                          onChange={(e) => setElementWidth(parseInt(e.target.value))}
                        />
                      </div>
                      <div key="Height">
                        <Label className="text-gray-300 mb-1.5">Height</Label>
                        <Input
                          type="number"
                          className="bg-[#0a0a0c] border-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500/50"
                          value={elementHeight}
                          onChange={(e) => setElementHeight(parseInt(e.target.value))}
                        />
                      </div>
                  
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="static"
                      checked={elementStatic}
                      onCheckedChange={(checked) => setElementStatic(checked)}
                      className="data-[state=checked]:bg-purple-500 bg-gray-400"
                    />
                    <Label htmlFor="static" className="text-gray-300">Static Element</Label>
                  </div>
                  <div className="flex justify-end flex-col gap-2 ">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white transition duration-200"
                    onClick={handleCreateElement}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Element
                  </Button>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={()=>{
                      if (editElement) handleUpdateElement(editElement);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Update Element
                  </Button>
                  </div>
                </div>
              </div>

              {/* Existing Elements */}
              {filteredElemens.map((element) => (
                <div key={element.id} className="group bg-[#151518] hover:bg-[#1a1a1f] rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-500 shadow-lg hover:shadow-purple-500/10">
                  <div className="overflow-hidden rounded-lg mb-4 bg-[#0a0a0c] border border-gray-800">
                    <img 
                      src={element.imageUrl} 
                      alt={element.name}
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">{element.name}</h3>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="bg-[#0a0a0c] text-gray-300 px-3 py-1 rounded-full border border-gray-800">
                      {element.width}x{element.height}
                    </span>
                    <span className={`px-3 py-1 rounded-full ${
                      element.static 
                        ? 'bg-purple-900/50 text-purple-200 border border-purple-700' 
                        : 'bg-blue-900/50 text-blue-200 border border-blue-700'
                    }`}>
                      {element.static ? 'Static' : 'Dynamic'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" 
                      onClick={()=>{
                        setEditElement(element)
                        setElementName(element.name)
                        setElementImageUrl(element.imageUrl)
                        setElementWidth(element.width)
                        setElementHeight(element.height)
                        setElementStatic(element.static)
                      }}
                      className="flex-1 bg-[#0a0a0c] border-gray-800 text-gray-300 hover:text-purple-200 hover:bg-purple-900/50 hover:border-purple-700">
                      Edit
                    </Button>
                    <Button variant="outline"  
                      onClick={()=>{
                        handleDeleteElement(element.id)
                      }}
                      className="flex-1 bg-[#0a0a0c] border-gray-800 text-red-400 hover:text-red-200 hover:bg-red-900/50 hover:border-red-700">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Avatars Tab */}
          <TabsContent value="avatars" className="mt-6">
          <div className="relative mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  className="w-1/3 bg-[#151518] text-gray-200 pl-10 border-gray-800 focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Search for an avatar..."
                  value={searchAvatar}
                  onChange={(e)=>{
                    setSearchAvatar(e.target.value)
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Avatar Card */}
              <div className="group bg-[#151518] hover:bg-[#1a1a1f] rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-500 shadow-lg hover:shadow-purple-500/10">
                <h3 className="text-xl font-semibold text-gray-200 mb-4">Add New Avatar</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300 mb-1.5">Avatar Name</Label>
                    <Input
                      className="bg-[#0a0a0c] border-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500/50"
                      value={avatarName}
                      onChange={(e) => setAvatarName(e.target.value)}
                      placeholder="Business Casual"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-1.5">Image URL</Label>
                    <Input
                      className="bg-[#0a0a0c] border-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500/50"
                      value={avatarImageUrl}
                      onChange={(e) =>(setAvatarImageUrl(e.target.value))}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white transition duration-200"
                    onClick={handleCreateAvatar}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Avatar
                  </Button>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => { if (editAvatar) handleUpdateAvatar(editAvatar); }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Edit Avatar
                  </Button>
                  
                </div>
              </div>

              {/* Existing Avatars */}
              {filteredAvatars.map((avatar) => (
                <div key={avatar.id} className="group bg-[#151518] hover:bg-[#1a1a1f] rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-500 shadow-lg hover:shadow-purple-500/10">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <img 
                      src={avatar.imageUrl} 
                      alt={avatar.name}
                      className="relative w-full h-full object-cover rounded-full bg-[#0a0a0c] border-2 border-gray-800 group-hover:border-purple-700 transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 text-center mb-4">{avatar.name}</h3>
                  <div className="flex space-x-2">
                    <Button onClick={() => {
                      setEditAvatar(avatar);
                      setAvatarName(avatar.name)
                      setAvatarImageUrl(avatar.imageUrl)
                    }} variant="outline" className="flex-1 border-gray-700/50 text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 transition duration-200">
                      Edit
                    </Button>
                    <Button variant="outline" onClick={()=>{
                      handleDeleteAvatar(avatar.id)
                    }} className="flex-1 border-gray-700/50 text-red-600 hover:text-red-800 hover:bg-red-700/50 transition duration-200">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Maps Tab */}
          <TabsContent value="maps" className="mt-6">
          <div className="relative mb-6 ">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  className="w-1/3 bg-[#151518] text-gray-200 pl-10 border-gray-800 focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Search for a map..."
                  value={searchMap}
                  onChange={(e)=>{
                    setSearchMap(e.target.value)
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Map Card */}
              <div className="group bg-[#151518] hover:bg-[#1a1a1f] rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-500 shadow-lg hover:shadow-purple-500/10">
                <h3 className="text-xl font-semibold text-gray-200 mb-4">Add New Map</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300 mb-1.5">Map Name</Label>
                    <Input
                      className="bg-[#0a0a0c] border-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500/50"
                      value={mapName}
                      onChange={(e) => setMapName(e.target.value)}
                      placeholder="Tech Hub Campus"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-1.5">Thumbnail URL</Label>
                    <Input
                      className="bg-[#0a0a0c] border-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500/50"
                      value={mapThumbnail}
                      onChange={(e) => setMapThumbnail(e.target.value)}
                      placeholder="https://example.com/thumbnail.png"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 mb-1.5">Dimensions</Label>
                    <Input
                      className="bg-[#0a0a0c] border-gray-800 text-gray-200 focus:ring-2 focus:ring-purple-500/50"
                      value={mapDimensions}
                      onChange={(e) => setMapDimensions(e.target.value)}
                      placeholder="1920x1080"
                     
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white transition duration-200"
                      onClick={handleCreateMap}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Map
                    </Button>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        if (editMap) handleUpdateMap(editMap);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Update Map
                    </Button>
                  </div>
                </div>
              </div>

              {/* Existing Maps */}
              {filteredMaps.map((map) => (
                <div onClick={()=>{
                  navigate(`/map/${map.id}`)
                }} key={map.id} className="group bg-[#151518] hover:bg-[#1a1a1f] rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-500 shadow-lg hover:shadow-purple-500/10">
                  <div className="overflow-hidden rounded-lg mb-4 bg-[#0a0a0c] border border-gray-800">
                    <img 
                      src={map.thumbnail} 
                      alt={map.name}
                      className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{map.name}</h3>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="bg-[#0a0a0c] text-gray-300 px-3 py-1 rounded-full border border-gray-800">
                      {map.width}x{map.height}
                    </span>
                    <span className="bg-purple-900/50 text-purple-200 px-3 py-1 rounded-full border border-purple-700">
                      {map.users} users
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditMap(map);
                        setMapName(map.name);
                        setMapThumbnail(map.thumbnail);
                        setMapDimensions(`${map.width}x${map.height}`);
                        
                      }} 
                      variant="outline" 

                      className="flex-1 border-gray-700/50 text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 transition duration-200"
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMap(map.id)
                      }} 
                      variant="outline" 
                      className="flex-1 border-gray-700/50 text-red-600 hover:text-red-800 hover:bg-red-700/50 transition duration-200"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ToastContainer 
        position="bottom-right"
        theme="dark"
        toastClassName="bg-[#2a2b32] text-gray-200"
      />
    </div>
  );
  }

};

export default AdminDashboard;
