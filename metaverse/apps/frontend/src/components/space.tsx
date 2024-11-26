import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import axios from 'axios';

export interface Element {
  id: number;
  imageUrl: string;
  name: string;
  width: number;
  height: number;
  static: boolean;
  x: number;
  y: number;
  elementId: number;
  element: Element;
}

export interface Space {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  capacity: number;
  width: number;
  height: number;
  mapId: string;
  elements: {
    id: string;
    element: Element;
  }[];
}

const SpaceComponent = ({ space }: { space: Space }) => {
  console.log(space)
  const phaserRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [elements, setElements] = useState<Element[]>(space.elements.map((e) => ({
    id: e.element.id,
    imageUrl: e.element.imageUrl,
    name: e.element.name,
    width: e.element.width,
    height: e.element.height,
    static: e.element.static,
    x: e.x || 0,
    y: e.y || 0,
    elementId: e.element.id,
    element: e.element
  })));
  const [avatars, setAvatars] = useState<Element[]>([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [zoom, setZoom] = useState(4);
  const [gridSize] = useState(32);

  // Fetch avatars on component mount
  useEffect(() => {
    console.log(elements)
    const fetchAvatars = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${BACKEND_URL}/admin/avatars`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        setAvatars(res.data.avatars);
      } catch (error) {
        console.error("Failed to fetch avatars:", error);
      }
    };
    fetchAvatars();
  }, [BACKEND_URL]);

  // Initialize Phaser game
  useEffect(() => {
    if (!phaserRef.current) return;

    class MapScene extends Phaser.Scene {
      constructor() {
        super({ key: `${space.id}_OfficeScene` });
      }

      preload() {
        // Load element images
        elements.forEach(element => {
          const imageKey = `element_${element.id}`;
          const url = new URL(element.imageUrl);
          url.searchParams.append('t', Date.now().toString());
          this.load.image({
            key: imageKey,
            url: url.toString(),
          });
        });

        // Load avatar images
        avatars.forEach(avatar => {
          const imageKey = `avatar_${avatar.id}`;
          const url = new URL(avatar.imageUrl);
          url.searchParams.append('t', Date.now().toString());
          this.load.image({
            key: imageKey,
            url: url.toString(),
          });
        });

        // Error handling for image loading
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
        for (let x = 0; x < space.width; x += gridSize) {
          for (let y = 0; y < space.height; y += gridSize) {
            this.add.rectangle(x, y, gridSize, gridSize)
              .setStrokeStyle(1, 0x777777)
              .setOrigin(0)
              .setDepth(0);
          }
        }

        // Place elements on the grid
        elements.forEach(element => {
           this.add.image(element.x, element.y, `element_${element.id}`)
            .setOrigin(0)
            .setDepth(1)
            .setDisplaySize(element.width*gridSize, element.height*gridSize);
        });

        //adding zoom controls to the scene 
      
        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
          const camera = this.cameras.main;
          const oldZoom = camera.zoom;
          const newZoom = Math.min(Math.max(oldZoom - (deltaY * 0.001), 0.5), 4);
          
          // Get pointer position in world coordinates before zoom
          const worldPoint = {
            x: (pointer.x / oldZoom) + camera.scrollX,
            y: (pointer.y / oldZoom) + camera.scrollY
          };
          
          camera.setZoom(newZoom);
          
          // Calculate new camera position to maintain pointer position
          camera.scrollX = worldPoint.x - (pointer.x / newZoom);
          camera.scrollY = worldPoint.y - (pointer.y / newZoom);
          
          setZoom(newZoom);
        });
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: phaserRef.current,
      width: 1600,
      height: 1200,
      backgroundColor: '#FFFFFF',
      scene: MapScene,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, [elements, avatars, space.id, space.width, space.height, gridSize]);

  const handleZoom = (direction: 'in' | 'out') => {
    const scene = gameRef.current?.scene.getScene(`${space.id}_OfficeScene`) as any;
    if (!scene) return;

    const camera = scene.cameras.main;
    const oldZoom = camera.zoom;
    const newZoom = direction === 'in' 
      ? Math.min(oldZoom + 0.2, 2)
      : Math.max(oldZoom - 0.2, 0.5);
    
    // Get center of viewport in world coordinates before zoom
    const centerX = camera.midPoint.x;
    const centerY = camera.midPoint.y;
    
    camera.setZoom(newZoom);
    
    // Adjust camera position to keep center point
    const zoomFactor = newZoom / oldZoom;
    const dx = centerX * (zoomFactor - 1);
    const dy = centerY * (zoomFactor - 1);
    
    camera.scrollX += dx;
    camera.scrollY += dy;
    
    setZoom(newZoom);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-900 to-indigo-900">
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
            onClick={() => handleZoom('in')}
            title="Zoom In"
          >
            <FiZoomIn size={24} />
          </button>
          
          <button
            className="p-3 text-white/80 hover:bg-white/10 rounded-xl transition-all duration-300"
            onClick={() => handleZoom('out')}
            title="Zoom Out"
          >
            <FiZoomOut size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaceComponent;
