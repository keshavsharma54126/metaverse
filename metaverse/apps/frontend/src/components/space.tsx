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
  console.log("currentUser",currentUser)
  console.log("participants",participants)
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
  const [gridSize] = useState(16);

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
    console.log("participants in space",participants)
    if (!phaserRef.current) return;

    class MapScene extends Phaser.Scene {
      private players: Map<string, Phaser.GameObjects.Image> = new Map();
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      private staticObjects!: Phaser.GameObjects.Group;
      
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
            console.log("current user Safe URL:", safeUrl);
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
              const imageKey = `avatar_${participant.avatarId}`;
              console.log("loading participant avatar with key:", imageKey)
              const safeUrl = ensureHttps(participant.url);
              console.log("Safe URL:", safeUrl);
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

        // Create a physics group for static objects
        this.staticObjects = this.add.group();

        // Add elements with physics
        elements.forEach(element => {
          const elementSprite = this.add.image(element.x, element.y, `element_${element.id}`)
            .setOrigin(0)
            .setDepth(1)
            .setDisplaySize(element.width*gridSize, element.height*gridSize);

          if (element.static) {
            // Add physics to static elements
            this.physics.add.existing(elementSprite, true); // true makes it static
            const physicsBody = (elementSprite.body as Phaser.Physics.Arcade.Body);
            physicsBody.setSize(element.width*gridSize, element.height*gridSize);
            this.staticObjects.add(elementSprite);
          }
        });

        const camera = this.cameras.main;
        setCamera(camera);
        camera.removeBounds()
        camera.setZoom(2);
        
        // Set initial camera position to center of the space
        const centerX = space.width / 2;
        const centerY = space.height / 2;
        camera.centerOn(centerX, centerY);

        // Update wheel handler
        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
          const camera = this.cameras.main;
          const oldZoom = camera.zoom;
          const newZoom = Phaser.Math.Clamp(oldZoom - (deltaY * 0.001), 1, 4);

          // Store current center point
          const centerX = camera.scrollX + (camera.width / 2 / oldZoom);
          const centerY = camera.scrollY + (camera.height / 2 / oldZoom);

          camera.setZoom(newZoom);
          
          // Maintain the same center point after zoom
          camera.scrollX = centerX - (camera.width / 2 / newZoom);
          camera.scrollY = centerY - (camera.height / 2 / newZoom);
        });
      
        // Initialize player with physics
        let player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
        if (currentUser && currentUser.spawn) {
          player = this.physics.add.image(
            currentUser.spawn.x, 
            currentUser.spawn.y, 
            `avatar_${currentUser.avatarId}`
          )
            .setOrigin(0)
            .setDepth(1)
            .setDisplaySize(1 * gridSize, 1 * gridSize);

          player.setCollideWorldBounds(true);
          this.physics.add.collider(player, this.staticObjects);

          this.players.set(currentUser.id, player);
          camera.startFollow(player, true, 0.1, 0.1);
          camera.setFollowOffset(-player.width / 2, -player.height / 2);
        }

        // Initialize other participants with their direct x,y coordinates
        participants.forEach((participant: any) => {
          const participantSprite = this.add.image(
            participant.x, 
            participant.y, 
            `avatar_${participant.avatarId}`
          )
            .setOrigin(0)
            .setDepth(1)
            .setDisplaySize(1 * gridSize, 1 * gridSize);

          this.players.set(participant.id, participantSprite);
        });

        // Handle websocket events for player movement
        if (wsRef.current) {
          wsRef.current.setHandlers({
            onPositionUpdate: (userId:string,id:string,x:number,y:number) => {
              const player = this.players.get(id);
              if (player) {
                player.setPosition(x,y );
                if (userId === currentUser.id) {
                  camera.startFollow(player, true);
                }
              }
            },
            onUserLeft: (userId:string,id:string) => {
              const player = this.players.get(id);
              if (player) {
                player.destroy();
                this.players.delete(userId);
              }
            },
            onMovementRejected: (userId:string, x:number, y:number) => {
              console.log('Movement rejected, resetting to:', { x, y });
              if (userId === currentUser.id) {
                this.currentPosition = { x, y };
                const player = this.players.get(userId);
                if (player) {
                  player.setPosition(x * gridSize, y * gridSize);
                }
              }
            }
          });
        }

        this.cursors = this.input.keyboard!.createCursorKeys();
        
        // Track last move time to control movement rate
        let lastMoveTime = 0;
        const moveDelay = 150; // Adjust this value to control movement speed (milliseconds)

        // Initialize position from spawn point
        if (currentUser && currentUser.spawn) {
          this.currentPosition = {
            x: currentUser.spawn.x,
            y: currentUser.spawn.y
          };
        }

        // Add update method to handle continuous movement
        this.events.on('update', () => {
          if (!player) return;

          const currentTime = Date.now();
          if (currentTime - lastMoveTime < moveDelay) return;

          // Reset velocity at the start of each update
          player.setVelocity(0);

          let newX = player.x;
          let newY = player.y;
          let shouldMove = false;

          // Check current state of movement keys and update position
          if (this.cursors.up.isDown || this.input.keyboard!.addKey('W').isDown) {
            newY = player.y - gridSize;
            shouldMove = true;
          } else if (this.cursors.down.isDown || this.input.keyboard!.addKey('S').isDown) {
            newY = player.y + gridSize;
            shouldMove = true;
          }

          if (this.cursors.left.isDown || this.input.keyboard!.addKey('A').isDown) {
            newX = player.x - gridSize;
            shouldMove = true;
          } else if (this.cursors.right.isDown || this.input.keyboard!.addKey('D').isDown) {
            newX = player.x + gridSize;
            shouldMove = true;
          }

          // Only update position if movement is requested and no collision would occur
          if (shouldMove) {
            // Check for potential collisions before moving
            const bounds = this.staticObjects.getChildren();
            let canMove = true;

            bounds.forEach((bound: any) => {
              const boundBox = bound.getBounds();
              const playerBox = new Phaser.Geom.Rectangle(newX, newY, gridSize, gridSize);
              
              if (Phaser.Geom.Rectangle.Overlaps(boundBox, playerBox)) {
                canMove = false;
              }
            });

            if (canMove) {
              player.setPosition(newX, newY);

              // Send the new position to the server
              wsRef.current?.send({
                type: 'move',
                x: newX,
                y: newY
              });

              lastMoveTime = currentTime;
            }
          }
        });
      }

      // Add update method for continuous physics
  
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
      ? Math.min(oldZoom + 0.2, 4)
      : Math.max(oldZoom - 0.2, 0.2);

    // Get the center point of the camera view
    const centerX = space.width / 2;
    const centerY = space.height / 2;

    // Set camera to center point before zooming
    camera.centerOn(centerX, centerY);
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
