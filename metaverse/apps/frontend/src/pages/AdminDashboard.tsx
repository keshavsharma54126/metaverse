import { useEffect, useState } from 'react';
import { Plus, Search, Star, Clock, Settings, LogOut, Map } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Switch } from '../components/Switch';
import { Label } from '../components/Label';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  
  const [maps, setMaps] = useState([
    { id: 1, name: 'Tech Hub Campus', thumbnail: '/api/placeholder/400/300', dimensions: '1920x1080', users: 12, capacity: 50 },
    { id: 2, name: 'Zen Garden Office', thumbnail: '/api/placeholder/400/300', dimensions: '1920x1080', users: 8, capacity: 30 }
  ]);

  useEffect(()=>{
    updateAvatars()
    updateElements()
  },[])


  
  const [newMap, setNewMap] = useState({
    thumbnail: '',
    name: '',
    dimensions: '',
    defaultElements: []
  });

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

  const handleCreateMap = () => {
    if (newMap.name && newMap.thumbnail && newMap.dimensions) {
      setMaps([...maps, { 
        id: maps.length + 1, 
        ...newMap, 
        users: 0, 
        capacity: 50 
      }]);
      setNewMap({ thumbnail: '', name: '', dimensions: '', defaultElements: [] });
      toast.success("Map created successfully!");
    }
  };
  const handleLogout = ()=>{
    console.log("clicked")
    try{
      localStorage.removeItem("authToken")
      navigate("/adminSignin")
    }catch(e){
      console.error(e,"error while logging out")
    }
  }
  if(!localStorage.getItem("authToken")){
    navigate("/adminSignin")
  }
  if(!localStorage.getItem("authToken")){
    navigate("/adminSignin")
  }
  return (
    <div className="flex h-screen bg-[#0a0b0f] flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#13141a] p-4 border-r border-[#1f2128] shadow-lg">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="text-white text-xl font-semibold">MetaSpace</span>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input 
            className="w-full pl-10 bg-[#1f2128] border-none text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-purple-500" 
            placeholder="Search..."
          />
        </div>

        <div className="space-y-1">
          {[
            { icon: Map, label: 'Manage Spaces' },
            { icon: Star, label: 'Featured' },
            { icon: Clock, label: 'Recent' },
            { icon: Settings, label: 'Settings' },
            { icon: LogOut, label: 'Logout',onClick:handleLogout }
          ].map((item) => (
            <Button
              key={item.label}
              onClick={item.onClick}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:bg-[#1f2128] hover:text-white"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="elements" className="w-full">
          <TabsList className="bg-[#13141a] border-b border-[#1f2128] p-0">
            {['elements', 'avatars', 'maps'].map((tab) => (
              <TabsTrigger 
                key={tab}
                value={tab} 
                className="px-4 md:px-6 py-2 md:py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#1f2128] hover:bg-[#1f2128] transition duration-200"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Elements Tab */}
          <TabsContent value="elements" className="mt-4 md:mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Add New Element Card */}
              <div className="group bg-[#13141a] rounded-xl p-4 md:p-6 border border-[#1f2128] hover:border-purple-500 transition-all duration-300 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Element</h3>
                <div className="space-y-4">
                <div>
                    <Label className="text-gray-400 mb-1.5">Element Name</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={elementName}
                      onChange={(e) => setElementName(e.target.value)}
                      placeholder="Office Desk"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400 mb-1.5">Image URL</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={elementImageUrl}
                      onChange={(e) => setElementImageUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    
                      <div key="Width">
                        <Label className="text-gray-400 mb-1.5">Width</Label>
                        <Input
                          type="number"
                          className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                          value={elementWidth}
                          onChange={(e) => setElementWidth(parseInt(e.target.value))}
                        />
                      </div>
                      <div key="Height">
                        <Label className="text-gray-400 mb-1.5">Height</Label>
                        <Input
                          type="number"
                          className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
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
                    <Label htmlFor="static" className="text-gray-400">Static Element</Label>
                  </div>
                  <div className="flex space-x-2 justify-end ">
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
              {elements.map((element) => (
                <div key={element.id} className="group bg-[#13141a] rounded-xl p-4 md:p-6 border border-[#1f2128] hover:border-purple-500 transition-all duration-300 shadow-md">
                  <img 
                    src={element.imageUrl} 
                    alt={element.name}
                    className="w-full h-40 object-cover rounded-lg mb-4 bg-[#1f2128]"
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{element.name}</h3>
                  <div className="flex justify-between text-gray-400 text-sm mb-4">
                    <span>{element.width}x{element.height}</span>
                    <span>{element.static ? 'Static' : 'Dynamic'}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button  onClick={()=>{
                      setEditElement(element)
                      setElementName(element.name)
                      setElementImageUrl(element.imageUrl)
                      setElementWidth(element.width)
                      setElementHeight(element.height)
                      setElementStatic(element.static)
                      setEditElement(element)
                    }} variant="outline" className="flex-1 border-[#1f2128] text-gray-400 hover:text-white hover:bg-[#1f2128] transition duration-200">
                      Edit
                    </Button>
                    <Button onClick={()=>handleDeleteElement(element.id)} variant="outline"  className="flex-1 border-[#1f2128] text-red-400 hover:text-white hover:bg-red-600 transition duration-200">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Avatars Tab */}
          <TabsContent value="avatars" className="mt-4 md:mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Add New Avatar Card */}
              <div className="group bg-[#13141a] rounded-xl p-4 md:p-6 border border-[#1f2128] hover:border-purple-500 transition-all duration-300 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Avatar</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-400 mb-1.5">Avatar Name</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={avatarName}
                      onChange={(e) => setAvatarName(e.target.value)}
                      placeholder="Business Casual"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400 mb-1.5">Image URL</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
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
              {avatars.map((avatar) => (
                <div key={avatar.id} className="group bg-[#13141a] rounded-xl p-4 md:p-6 border border-[#1f2128] hover:border-purple-500 transition-all duration-300 shadow-md">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <img 
                      src={avatar.imageUrl} 
                      alt={avatar.name}
                      className="w-full h-full object-cover rounded-full bg-[#1f2128]"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white text-center mb-4">{avatar.name}</h3>
                  <div className="flex space-x-2">
                    <Button onClick={() => {
                      setEditAvatar(avatar);
                      setAvatarName(avatar.name)
                      setAvatarImageUrl(avatar.imageUrl)
                    }} variant="outline" className="flex-1 border-[#1f2128] text-gray-400 hover:text-white hover:bg-[#1f2128] transition duration-200">
                      Edit
                    </Button>
                    <Button variant="outline" onClick={()=>{
                      handleDeleteAvatar(avatar.id)
                    }} className="flex-1 border-[#1f2128] text-red-400 hover:text-white hover:bg-red-600 transition duration-200">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Maps Tab */}
          <TabsContent value="maps" className="mt-4 md:mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Add New Map Card */}
              <div className="group bg-[#13141a] rounded-xl p-4 md:p-6 border border-[#1f2128] hover:border-purple-500 transition-all duration-300 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Map</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-400 mb-1.5">Map Name</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={newMap.name}
                      onChange={(e) => setNewMap({...newMap, name: e.target.value})}
                      placeholder="Tech Hub Campus"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400 mb-1.5">Thumbnail URL</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={newMap.thumbnail}
                      onChange={(e) => setNewMap({...newMap, thumbnail: e.target.value})}
                      placeholder="https://example.com/thumbnail.png"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400 mb-1.5">Dimensions</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={newMap.dimensions}
                      onChange={(e) => setNewMap({...newMap, dimensions: e.target.value})}
                      placeholder="1920x1080"
                    />
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white transition duration-200"
                    onClick={handleCreateMap}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Map
                  </Button>
                </div>
              </div>

              {/* Existing Maps */}
              {maps.map((map) => (
                <div key={map.id} className="group bg-[#13141a] rounded-xl p-4 md:p-6 border border-[#1f2128] hover:border-purple-500 transition-all duration-300 shadow-md">
                  <img 
                    src={map.thumbnail} 
                    alt={map.name}
                    className="w-full h-40 object-cover rounded-lg mb-4 bg-[#1f2128]"
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{map.name}</h3>
                  <div className="flex justify-between text-gray-400 text-sm mb-4">
                    <span>{map.dimensions}</span>
                    <span>{map.users} / {map.capacity} users</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-gray-400 hover:text-white hover:bg-[#1f2128] transition duration-200">
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-red-400 hover:text-white hover:bg-red-600 transition duration-200">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
