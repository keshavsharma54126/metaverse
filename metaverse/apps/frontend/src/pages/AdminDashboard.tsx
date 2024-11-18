import  { useState } from 'react';
import { Plus, Search, Star, Clock, Settings, LogOut, Image, Map, User, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Switch } from '../components/Switch';
import { Label } from '../components/Label';

const AdminDashboard = () => {
  const [elements, setElements] = useState([
    { id: 1, name: 'Office Desk', imageUrl: '/api/placeholder/400/300', width: 100, height: 100, static: true },
    { id: 2, name: 'Meeting Table', imageUrl: '/api/placeholder/400/300', width: 200, height: 150, static: true }
  ]);
  
  const [avatars, setAvatars] = useState([
    { id: 1, name: 'Default Avatar', imageUrl: '/api/placeholder/200/200' },
    { id: 2, name: 'Business Avatar', imageUrl: '/api/placeholder/200/200' }
  ]);
  
  const [maps, setMaps] = useState([
    { id: 1, name: 'Tech Hub Campus', thumbnail: '/api/placeholder/400/300', dimensions: '1920X1080', users: 12, capacity: 50 },
    { id: 2, name: 'Zen Garden Office', thumbnail: '/api/placeholder/400/300', dimensions: '1920X1080', users: 8, capacity: 30 }
  ]);

  const [newElement, setNewElement] = useState({
    imageUrl: '',
    width: 0,
    height: 0,
    static: true
  });
  
  const [newAvatar, setNewAvatar] = useState({
    imageUrl: '',
    name: ''
  });
  
  const [newMap, setNewMap] = useState({
    thumbnail: '',
    name: '',
    dimensions: '',
    defaultElements: []
  });

  const handleCreateAvatar = () => {
    if (newAvatar.name && newAvatar.imageUrl) {
      setAvatars([...avatars, { id: avatars.length + 1, ...newAvatar }]);
      setNewAvatar({ imageUrl: '', name: '' });
    }
  };

  const handleCreateElement = () => {
    if (newElement.imageUrl && newElement.width && newElement.height) {
      setElements([...elements, { id: elements.length + 1, name: `Element ${elements.length + 1}`, ...newElement }]);
      setNewElement({ imageUrl: '', width: 0, height: 0, static: true });
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
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0b0f]">
      {/* Sidebar */}
      <div className="w-64 bg-[#13141a] p-4 border-r border-[#1f2128]">
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
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-[#1f2128] hover:text-white">
            <Map className="mr-2 h-4 w-4" />
            Manage Spaces
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-[#1f2128] hover:text-white">
            <Star className="mr-2 h-4 w-4" />
            Featured
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-[#1f2128] hover:text-white">
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-[#1f2128] hover:text-white">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-[#1f2128] hover:text-white">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="elements" className="w-full">
          <TabsList className="bg-[#13141a] border-b border-[#1f2128] p-0">
            <TabsTrigger 
              value="elements" 
              className="px-6 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#1f2128]"
            >
              Elements
            </TabsTrigger>
            <TabsTrigger 
              value="avatars" 
              className="px-6 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#1f2128]"
            >
              Avatars
            </TabsTrigger>
            <TabsTrigger 
              value="maps" 
              className="px-6 py-3 text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#1f2128]"
            >
              Maps
            </TabsTrigger>
          </TabsList>

          {/* Elements Tab */}
          <TabsContent value="elements" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Element Card */}
              <div className="group bg-[#13141a] rounded-xl p-6 border border-[#1f2128] hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Element</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-400 mb-1.5">Image URL</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={newElement.imageUrl}
                      onChange={(e) => setNewElement({...newElement, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.png"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 mb-1.5">Width</Label>
                      <Input
                        type="number"
                        className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                        value={newElement.width}
                        onChange={(e) => setNewElement({...newElement, width: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 mb-1.5">Height</Label>
                      <Input
                        type="number"
                        className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                        value={newElement.height}
                        onChange={(e) => setNewElement({...newElement, height: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="static"
                      checked={newElement.static}
                      onCheckedChange={(checked) => setNewElement({...newElement, static: checked})}
                      className="data-[state=checked]:bg-purple-500"
                    />
                    <Label htmlFor="static" className="text-gray-400">Static Element</Label>
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleCreateElement}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Element
                  </Button>
                </div>
              </div>

              {/* Existing Elements */}
              {elements.map((element) => (
                <div key={element.id} className="group bg-[#13141a] rounded-xl p-6 border border-[#1f2128] hover:border-purple-500/50 transition-all duration-300">
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
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-gray-400 hover:text-white hover:bg-[#1f2128]">
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-red-400 hover:text-white hover:bg-red-600">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Avatars Tab */}
          <TabsContent value="avatars" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Avatar Card */}
              <div className="group bg-[#13141a] rounded-xl p-6 border border-[#1f2128] hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Avatar</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-400 mb-1.5">Avatar Name</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={newAvatar.name}
                      onChange={(e) => setNewAvatar({...newAvatar, name: e.target.value})}
                      placeholder="Business Casual"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400 mb-1.5">Image URL</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={newAvatar.imageUrl}
                      onChange={(e) => setNewAvatar({...newAvatar, imageUrl: e.target.value})}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleCreateAvatar}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Avatar
                  </Button>
                </div>
              </div>

              {/* Existing Avatars */}
              {avatars.map((avatar) => (
                <div key={avatar.id} className="group bg-[#13141a] rounded-xl p-6 border border-[#1f2128] hover:border-purple-500/50 transition-all duration-300">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <img 
                      src={avatar.imageUrl} 
                      alt={avatar.name}
                      className="w-full h-full object-cover rounded-full bg-[#1f2128]"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white text-center mb-4">{avatar.name}</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-gray-400 hover:text-white hover:bg-[#1f2128]">
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-red-400 hover:text-white hover:bg-red-600">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Maps Tab */}
          <TabsContent value="maps" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Map Card */}
              <div className="group bg-[#13141a] rounded-xl p-6 border border-[#1f2128] hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">Create New Map</h3>
                <div className="space-y-4 ...400 mb-1.5">Image URL</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={newAvatar.imageUrl}
                      onChange={(e) => setNewAvatar({...newAvatar, imageUrl: e.target.value})}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleCreateAvatar}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Avatar
                  </Button>
                </div>
              </div>

              {/* Existing Avatars */}
              {avatars.map((avatar) => (
                <div key={avatar.id} className="group bg-[#13141a] rounded-xl p-6 border border-[#1f2128] hover:border-purple-500/50 transition-all duration-300">
                  <img 
                    src={avatar.imageUrl} 
                    alt={avatar.name}
                    className="w-full h-40 object-cover rounded-lg mb-4 bg-[#1f2128]"
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{avatar.name}</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-gray-400 hover:text-white hover:bg-[#1f2128]">
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-red-400 hover:text-white hover:bg-red-600">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Maps Tab */}
          <TabsContent value="maps" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Map Card */}
              <div className="group bg-[#13141a] rounded-xl p-6 border border-[#1f2128] hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Map</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-400 mb-1.5">Map Name</Label>
                    <Input
                      className="bg-[#1f2128] border-none text-gray-300 focus:ring-2 focus:ring-purple-500"
                      value={newMap.name}
                      onChange={(e) => setNewMap({...newMap, name: e.target.value})}
                      placeholder="Zen Garden"
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
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleCreateMap}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Map
                  </Button>
                </div>
              </div>

              {/* Existing Maps */}
              {maps.map((map) => (
                <div key={map.id} className="group bg-[#13141a] rounded-xl p-6 border border-[#1f2128] hover:border-purple-500/50 transition-all duration-300">
                  <img 
                    src={map.thumbnail} 
                    alt={map.name}
                    className="w-full h-40 object-cover rounded-lg mb-4 bg-[#1f2128]"
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{map.name}</h3>
                  <div className="flex justify-between text-gray-400 text-sm mb-4">
                    <span>{map.dimensions}</span>
                    <span>{map.users} / {map.capacity} Users</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-gray-400 hover:text-white hover:bg-[#1f2128]">
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1 border-[#1f2128] text-red-400 hover:text-white hover:bg-red-600">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
