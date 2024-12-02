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

const SpaceComponent = ({ space,currentUser,participants,wsRef }: { space: Space,currentUser:any,participants:any,wsRef:any }) => {
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
  const [avatars, setAvatars] = useState<any[]>([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [zoom, setZoom] = useState(0);
  const[camera, setCamera] = useState<Phaser.Cameras.Scene2D.Camera>();
  const [gridSize] = useState(32);

  // Fetch avatars on component mount
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${BACKEND_URL}/user/metadata/bulk`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        console.log(res.data)
          setAvatars(res.data.avatars);
          console.log("avatars",res.data.avatars)


      } catch (error) {
        console.error("Failed to fetch avatars:", error);
      }
    };
    fetchAvatars();
  }, [BACKEND_URL]);

  // Initialize Phaser game
  useEffect(() => {
    console.log("currentUser",currentUser)
    console.log("participants",participants)
    if (!phaserRef.current) return;

    class MapScene extends Phaser.Scene {
      private players: Map<string, Phaser.GameObjects.Image> = new Map();
      
      constructor() {
        super({ key: `${space.id}_OfficeScene` });
      }

      preload() {
        const ensureHttps = (url: string) => {
          if (!url) return '';
          return url.startsWith('http') ? url : `https://${url}`;
        };

        // Load element images
        elements.forEach(element => {
          const imageKey = `element_${element.id}`;
          if (element.imageUrl) {
            try {
              const safeUrl = ensureHttps(element.imageUrl);
              const url = new URL(safeUrl);
              url.searchParams.append('t', Date.now().toString());
              this.load.image({
                key: imageKey,
                url: url.toString(),
              });
            } catch (error) {
              // Fallback: try loading the URL directly if URL construction fails
              this.load.image({
                key: imageKey,
                url: element.imageUrl,
              });
              console.warn(`Using direct URL for element ${element.id}:`, element.imageUrl);
            }
          }
        });

        // Load avatar images for current user
        if (currentUser?.url) {
          try {
            const imageKey = `avatar_${currentUser.avatarId}`;
            console.log("Loading current user avatar with key:", imageKey);
            const safeUrl = ensureHttps(currentUser.url);
            const url = new URL(safeUrl);
            url.searchParams.append('t', Date.now().toString());
            this.load.image({
              key: imageKey,
              url: url.toString(),
            });
          } catch (error) {
            console.warn(`Using direct URL for currentUser ${currentUser.id}:`, currentUser.url);
          }
        }

        // Load avatar images for participants
        participants?.forEach((participant: any) => {
          if (participant?.url) {
            try {
              const imageKey = `avatar_${participant.id}`;
              const safeUrl = ensureHttps(participant.url);
              const url = new URL(safeUrl);
              url.searchParams.append('t', Date.now().toString());
              this.load.image({
                key: imageKey,
                url: url.toString(),
              });
            } catch (error) {
              console.warn(`Using direct URL for participant ${participant.id}:`, participant.url);
            }
          }
        });

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

        elements.forEach(element => {
           this.add.image(element.x, element.y, `element_${element.id}`)
            .setOrigin(0)
            .setDepth(1)
            .setDisplaySize(element.width*gridSize, element.height*gridSize);
        });
        const camera = this.cameras.main;
        setCamera(camera);
        camera.setBounds(0, 0, space.width, space.height);
        camera?.setZoom(2)

        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
          const camera = this.cameras.main;
          const oldZoom = camera.zoom;
          const newZoom = Math.min(Math.max(oldZoom - (deltaY * 0.001), 0.7), 4);
          
          // Get the mouse position in world coordinates before zooming
          const worldPointBefore = camera.getWorldPoint(pointer.x, pointer.y);
          
          // Set the new zoom
          camera.setZoom(newZoom);
          
          // Get the mouse position in world coordinates after zooming
          const worldPointAfter = camera.getWorldPoint(pointer.x, pointer.y);
          
          // Calculate the difference in world coordinates
          const dx = worldPointBefore.x - worldPointAfter.x;
          const dy = worldPointBefore.y - worldPointAfter.y;
          
          // Adjust camera position
          camera.scrollX += dx;
          camera.scrollY += dy;
        });
      
        // Add current user with null check
        if (currentUser && currentUser.spawn) {
          const player = this.add.image(
            currentUser.spawn.x , 
            currentUser.spawn.y , 
            `avatar_${currentUser.avatarId}`
          )
            .setOrigin(0)
            .setDepth(1)
            .setDisplaySize(1*gridSize,1*gridSize);
          
          this.players.set(currentUser.id, player);
          
          // Configure camera follow with lerp for smooth movement
          camera.startFollow(player, true, 0.09, 0.09);
          camera.setFollowOffset(-player.width/2, -player.height/2);
        }

        // Add other participants with null checks
        // participants?.forEach((participant:any) => {
        //   if (participant.id !== currentUser?.id && participant.position) {
        //     console.log("Loading participant avatar with key:", `avatar_${participant.id}`);
        //     const player = this.add.image(
        //       participant.position.x * gridSize, 
        //       participant.position.y * gridSize, 
        //       `avatar_${participant.id}`
        //     )
        //       .setOrigin(0)
        //       .setDepth(2)
        //       .setDisplaySize(gridSize, gridSize);
            
        //     this.players.set(participant.id, player);
        //   }
        // });

        // Handle websocket events for player movement
        if (wsRef.current) {
          wsRef.current.setHandlers({
            onPositionUpdate: (userId:string, position:any) => {
              const player = this.players.get(userId);
              if (player) {
                player.setPosition(position.x * gridSize, position.y * gridSize);
              }
            },
            onUserJoined: (userId:string, position:any, avatar:string) => {
              const player = this.add.image(position.x * gridSize, position.y * gridSize, `player_${userId}`)
                .setOrigin(0)
                .setDepth(2)
                .setDisplaySize(gridSize, gridSize);
              
              this.players.set(userId, player);
            },
            onUserLeft: (userId:string) => {
              const player = this.players.get(userId);
              if (player) {
                player.destroy();
                this.players.delete(userId);
              }
            }
          });
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
  }, [elements, avatars, space.id, space.width, space.height, gridSize, currentUser, participants, wsRef]);

  const handleZoom = (direction: 'in' | 'out') => {
    const scene = gameRef.current?.scene.getScene(`${space.id}_OfficeScene`) as any;
    if (!scene) return;

    const camera = scene.cameras.main;
    const oldZoom = camera.zoom;
    const newZoom = direction === 'in' 
      ? Math.min(oldZoom + 0.2, 2)
      : Math.max(oldZoom - 0.2, 0.7);
    
    
    camera.setZoom(newZoom);
    
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
