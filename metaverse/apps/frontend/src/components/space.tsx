import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';


export interface Element {
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

const SpaceComponent = ({space}:{space:Space}) => {
  console.log(space)
  const phaserRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [zoom, setZoom] = useState(2);
  const [gridSize, setGridSize] = useState(32);
  const [loading,setLoading]=useState(true)

  // Fetch elements from backend

  useEffect(() => {
    
    
  }, []);

  useEffect(() => {
    if (!phaserRef.current) return;

    class MapScene extends Phaser.Scene {
      constructor() {
        super({ key: 'MapScene' });
      }
      
      create() {
        // Scene setup code here
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
    
    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

   


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

export default SpaceComponent;
