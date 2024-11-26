import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import axios from 'axios';
import { FiZoomIn, FiZoomOut} from 'react-icons/fi';
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

type Space = {
  id:string;
  name:string;
  thumbnail:string;
  description:string;
  capacity:number;
  width:number;
  height:number;
  mapId:string;
  elements:Element[];
}

const SpaceComponent = ({space}:{space:Space}) => {

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
        const res = await axios.get(`${BACKEND_URL}/user/space/${spaceId}`, {
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
      private grid: Phaser.GameObjects.Grid | null = null;
      private cameras: Phaser.Cameras.Scene2D.CameraManager | null = null;
      private players: Phaser.Physics.Arcade.Sprite[] = [];
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
      setLoading(true)
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
      <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-900 to-indigo-900">
        {/* Main Game Area */}
        <div className="flex-1 relative">
          <div ref={phaserRef} className="w-full h-full" />
          
          {/* Top Navigation Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-black/30 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <h1 className="text-white text-xl font-semibold">{space.name}</h1>
            </div>
          </div>

          {/* Tools Panel */}
          <div className="flex flex-col absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md rounded-2xl p-3 space-y-3 border border-white/10">
            <button
              className="p-3 text-white/80 hover:bg-white/10 rounded-xl transition-all duration-300"
              onClick={() => {
                const scene = gameRef.current?.scene.getScene('MapScene') as any;
                scene.cameras.setZoom(Math.min(scene.cameras.zoom + 0.2, 2));
                setZoom(scene.cameras.zoom);
              }}
              title="Zoom In"
            >
              <FiZoomIn size={24} />
            </button>
            
            <button
              className="p-3 text-white/80 hover:bg-white/10 rounded-xl transition-all duration-300"
              onClick={() => {
                const scene = gameRef.current?.scene.getScene('MapScene') as any;
                scene.cameras.setZoom(Math.max(scene.cameras.zoom - 0.2, 0.5));
                setZoom(scene.cameras.zoom);
              }}
              title="Zoom Out"
            >
              <FiZoomOut size={24} />
            </button>
          </div>
         
        </div>
      </div>
    );
  }
}

export default SpaceComponent;
