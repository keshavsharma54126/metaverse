import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import axios from 'axios';
import { FiZoomIn, FiZoomOut, FiSave, FiMove, FiArrowLeft, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import FancyLoader from './Loader';


interface Element {
  id: number;
  imageUrl: string;
  name: string;
  width: number;
  height: number;
  static: boolean;
  x:number,
  y:number
  elementId:number
  element:Element
  
}

interface Map{
  id:string;
  thumbnail:string;
  name:string;
  width:number;
  height:number;
  elements:Element[];
}

const MapEditor = ({mapId}:{mapId:string}) => {

  const phaserRef = useRef<HTMLDivElement>(null);
  const [map,setMap] = useState<Map|null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [zoom, setZoom] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const [gridSize, setGridSize] = useState(32);
  const [avatars, setAvatars] = useState<Element[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading,setLoading]=useState(true)

  // Fetch elements from backend

  useEffect(() => {
    const fetchMap = async()=>{
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${BACKEND_URL}/admin/maps/${mapId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        console.log(res.data.map);
        setMap(res.data.map);
      }catch(e){
        console.error("Failed to fetch map:", e);
      }
    }
    const fetchElements = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${BACKEND_URL}/admin/elements`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        setElements(res.data.elements);
      } catch (e) {
        console.error("Failed to fetch elements:", e);
      }
    };
    const fetchAvatars = async()=>{
      try{
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${BACKEND_URL}/admin/avatars`,{
          headers:{
            Authorization:`Bearer ${token}`,
            "Content-Type":"application/json"
          }
        })  
        setAvatars(res.data.avatars);
      }catch(e){
        console.error("Failed to fetch avatars:",e);
      }
    } 
    fetchElements();
    fetchMap();
    fetchAvatars();

    Promise.all([fetchElements(), fetchMap(), fetchAvatars()]).then(() => {
        setLoading(false)
    });
    
    
  }, []);

  useEffect(() => {
    if (!phaserRef.current) return;

    class MapScene extends Phaser.Scene {
      private placedElements: Phaser.GameObjects.Image[] = [];
      private dragPreview: Phaser.GameObjects.Image | null = null;
      private grid: Phaser.GameObjects.Grid | null = null;
      private cameras: Phaser.Cameras.Scene2D.CameraManager | null = null;
      private player: Phaser.Physics.Arcade.Sprite | null = null;
      private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

      constructor() {
        super({ key: 'MapScene' });
      }

      preload() {
        elements.forEach(element => {
          const imageKey = `element_${element.id}`;
        
          const url = new URL(element.imageUrl);
          url.searchParams.append('t', Date.now().toString());

          this.load.image({
            key: imageKey,
            url: url.toString(),
          });
        });

        avatars.forEach(avatar => {

          const imageKey = `avatar_${avatar.id}`;
          const url = new URL(avatar.imageUrl);
          url.searchParams.append('t', Date.now().toString());
          this.load.image({
            key: imageKey,
            url: url.toString(),
          });
        });

        // Add better error logging
        this.load.on('loaderror', (fileObj: any) => {
          console.error('Load Error:', {
            key: fileObj.key,
            url: fileObj.url,
            type: fileObj.type,
            error: fileObj.error
          });
        });
      }

      create() {
        // Create grid
        
        const width = map?.width;
        const height = map?.height;
        // Add background grid
        for (let x = 0; x < (width ?? 0); x += gridSize) {
          for (let y = 0; y < (height ?? 0); y += gridSize) {
            this.add.rectangle(x, y, gridSize, gridSize)
              .setStrokeStyle(1, 0x777777)
              .setOrigin(0)
              .setDepth(0);
          }
        }

        //laod saved elemetns first
        if(map?.elements){
          console.log("elements",map.elements)
          map.elements.forEach((ele)=>{
            const placedElement = this.add.image(ele.x,ele.y,`element_${ele.elementId}`)
            .setOrigin(0)
            .setDepth(1)
            .setDisplaySize(ele.element.width*gridSize,ele.element.height*gridSize);
            
            // Add interaction handlers
            placedElement.setInteractive({ draggable: true });

            // Store the static property on the game object for collision checking
            placedElement.setData('isStatic', ele.element.static);

            placedElement.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
              if(pointer.rightButtonDown()){
                placedElement.destroy();
                const index  = this.placedElements.indexOf(placedElement);
                if(index>-1){
                  this.placedElements.splice(index,1);
                }
              }
            })
            
            placedElement.on('pointerover', () => {
              placedElement.setTint(0x999999);
            });

            placedElement.on('pointerout', () => {
              placedElement.clearTint();
            });

            placedElement.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
              const x = Math.floor(dragX / gridSize) * gridSize;
              const y = Math.floor(dragY / gridSize) * gridSize;
              placedElement.setPosition(x, y);
            });

            this.placedElements.push(placedElement);
            
          })
          


        // Create preview image that follows mouse
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
          if (selectedElement && this.dragPreview) {
            const x = Math.floor(pointer.x / gridSize) * gridSize;
            const y = Math.floor(pointer.y / gridSize) * gridSize;
            this.dragPreview.setPosition(x, y);
            this.dragPreview.setVisible(true);
          }
        });

        // Handle element placement
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (selectedElement) {
            const x = Math.floor(pointer.x / gridSize) * gridSize;
            const y = Math.floor(pointer.y / gridSize) * gridSize;
            
            const element = this.add.image(x, y, `element_${selectedElement.id}`)
              .setOrigin(0)
              .setInteractive({ draggable: true })
              .setDepth(1)
              .setDisplaySize(selectedElement.width*gridSize, selectedElement.height*gridSize);

              if(selectedElement.static){
                element.setData("isStatic",true);
                this.physics.add.existing(element,true)
                if(this.player){
                  this.physics.add.collider(this.player,element)
                }
              }

              element.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                if (pointer.rightButtonDown()) {
                  element.destroy();
                  const index = this.placedElements.indexOf(element);
                  if (index > -1) {
                    this.placedElements.splice(index, 1);
                  }
                }
              });

            // Add hover effect
            element.on('pointerover', () => {
              element.setTint(0x999999);
            });

            element.on('pointerout', () => {
              element.clearTint();
            });

            // Handle dragging
            element.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
              const x = Math.floor(dragX / gridSize) * gridSize;
              const y = Math.floor(dragY / gridSize) * gridSize;
              element.setPosition(x, y);
            });

            this.placedElements.push(element);
          }
        });
        
        

        // Update preview when selected element changes
        this.updateDragPreview();

        // Setup camera controls
        this.cameras = this.cameras.main;
        this.cameras.setZoom(zoom);

        // Add mouse wheel zoom
        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
          const newZoom = this.cameras.zoom - (deltaY * 0.001);
          this.cameras.setZoom(Math.min(Math.max(newZoom, 0.5), 2));
          setZoom(this.cameras.zoom);
        });

        this.player = this.physics.add.sprite(map.width/2,map.height/2,`avatar_${avatars[1].id}`)
        .setOrigin(0)
        .setDepth(2)
        .setDisplaySize(1*gridSize,1*gridSize);

      if (this.player) {
        this.physics.add.existing(this.player,false);
        this.placedElements.forEach((el)=>{
          // Only add physics and collider for static elements
          if (el.getData('isStatic')) {
            this.physics.add.existing(el,true);
            this.physics.add.collider(this.player,el);
          }
        })
      }
      if(this.player && this.cameras ){
        this.cameras.startFollow(this.player); 
      }
      
      if (this.input?.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
      }

      
    }
   
      }
      update(){
        if(!this.player || !this.cursors){
          return
        }
        const speed =100
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        // Reset velocity
        playerBody.setVelocity(0);

        // Handle movement
        if (this.cursors?.left.isDown) {
          playerBody.setVelocityX(-speed);
        } else if (this.cursors?.right.isDown) {
          playerBody.setVelocityX(speed);
        }

        if (this.cursors?.up.isDown) {
              playerBody.setVelocityY(-speed);
            } else if (this.cursors?.down.isDown) {
              playerBody.setVelocityY(speed);
            }
      }

      updateDragPreview() {
        if (this.dragPreview) {
          this.dragPreview.destroy();
        }
        if (selectedElement) {
          this.dragPreview = this.add.image(0, 0, `element_${selectedElement.id}`)
            .setOrigin(0)
            .setAlpha(0.5)
            .setDepth(2)
            .setVisible(false)
            .setDisplaySize(selectedElement.width*gridSize, selectedElement.height*gridSize);
        }
      }
     
      
    }


    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: phaserRef.current,
      width: 1600,
      height: 1200,
      backgroundColor: '#FFFFFF',
      scene: MapScene,
      physics:{
        default:'arcade',
        arcade:{
          debug:false
        }
      }
    };
    
    gameRef.current = new Phaser.Game(config);
    gameRef.current.events.once('ready', () => {
      setLoading(false);
    });
    
    return () => {
      gameRef.current?.destroy(true);
    };
  }, [elements,selectedElement,map]);
  const saveMap = async()=>{
    const scene = gameRef.current?.scene.getScene("MapScene") as any;
    const mapData = {
      elements:scene.placedElements.map((el:any)=>({
        elementId:el.texture.key.split('_')[1],
        x:el.x,
        y:el.y,
        mapId:mapId,
      }))
    }
   
    try{
      const token = localStorage.getItem("authToken");
      await axios.put(`${BACKEND_URL}/admin/mapElements/${mapId}`,mapData,{
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"application/json"
        }
      })
      toast.success("Map saved successfully")
      
    }catch(e){
      toast.error("Failed to save map")
    }
  }

  const filteredElements = elements.filter(element =>
    element.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  if(loading){
    return <FancyLoader/>
    
  }
  else{ 
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Element Palette - Now with responsive sidebar */}
      <div className="w-full md:w-80 lg:w-96 bg-gray-800 p-4 md:p-6 overflow-y-auto border-b md:border-r border-gray-700/50 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
          <span className="bg-blue-500 w-2 h-8 rounded-full"></span>
          Elements Library
        </h2>

        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {filteredElements.map((element) => (
            <div
              key={element.id}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                selectedElement?.id === element.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-xl shadow-blue-500/20'
                  : 'bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-sm'
              }`}
              onClick={() => {
                if(selectedElement?.id===element.id){
                  setSelectedElement(null)
                }
                else{
                  setSelectedElement(element)
                }
              }}
            >
              <div className="relative group">
                <img
                  src={element.imageUrl}
                  alt={element.name}
                  className="w-full h-24 object-contain mb-3 rounded-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </div>
              <p className="text-sm font-medium text-white">{element.name}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">
                  {element.width}x{element.height}
                </p>
                {selectedElement?.id === element.id && (
                  <span className="text-xs text-emerald-400">Selected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="flex-1 relative">
        <div ref={phaserRef} className="w-full h-full" />
        
        {/* Enhanced Floating Toolbar */}
        <div className="absolute top-4 right-4 flex flex-col gap-3">
          {/* Back to Dashboard Button - NEW */}
          <Link
            to="/adminDashboard"
            className="px-6 py-3 bg-gray-800/90 backdrop-blur-md text-white rounded-xl hover:bg-gray-700/90 transition-all duration-300 flex items-center gap-2 shadow-xl group border border-gray-700/50"
          >
            <FiArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">Back to Dashboard</span>
          </Link>

          {/* Tools Group */}
          <div className="bg-gray-800/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-gray-700/50">
            <div className="flex flex-col gap-2">
              <button
                className="p-2.5 text-white hover:bg-blue-500/20 rounded-xl transition-all duration-300 group"
                onClick={() => setIsDragging(!isDragging)}
                title="Toggle Move Mode"
              >
                <FiMove size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button
                className="p-2.5 text-white hover:bg-blue-500/20 rounded-xl transition-all duration-300 group"
                onClick={() => {
                  const scene = gameRef.current?.scene.getScene('MapScene') as any;
                  scene.cameras.setZoom(Math.min(scene.cameras.zoom + 0.2, 2));
                  setZoom(scene.cameras.zoom);
                }}
                title="Zoom In"
              >
                <FiZoomIn size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button
                className="p-2.5 text-white hover:bg-blue-500/20 rounded-xl transition-all duration-300 group"
                onClick={() => {
                  const scene = gameRef.current?.scene.getScene('MapScene') as any;
                  scene.cameras.setZoom(Math.max(scene.cameras.zoom - 0.2, 0.5));
                  setZoom(scene.cameras.zoom);
                }}
                title="Zoom Out"
              >
                <FiZoomOut size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 shadow-xl group"
            onClick={() => {
              saveMap();
              setSelectedElement(null)
              window.location.reload();
            }}
          >
            <FiSave size={20} className="group-hover:scale-110 transition-transform" />
            <span  className="hidden md:inline">Save Map</span>
          </button>
        </div>
      </div>
    </div>
  );
  }
}

export default MapEditor;
