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
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      private currentPosition = {x:currentUser.spawn.x,y:currentUser.spawn.y};
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
        camera.removeBounds();
        camera.setZoom(2);
        
        // Set initial camera position to center of the space
        const centerX = space.width / 2;
        const centerY = space.height / 2;
        camera.centerOn(centerX, centerY);

        // Update wheel handler
        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
          const camera = this.cameras.main;
          const oldZoom = camera.zoom;
          const newZoom = Phaser.Math.Clamp(oldZoom - (deltaY * 0.001), 0.2, 4);

          // Store current center point
          const centerX = camera.scrollX + (camera.width / 2 / oldZoom);
          const centerY = camera.scrollY + (camera.height / 2 / oldZoom);

          camera.setZoom(newZoom);
          
          // Maintain the same center point after zoom
          camera.scrollX = centerX - (camera.width / 2 / newZoom);
          camera.scrollY = centerY - (camera.height / 2 / newZoom);
        });
      
        // Add current user with physics
        if (currentUser && currentUser.spawn) {
          const player = this.add.image(
            currentUser.spawn.x, 
            currentUser.spawn.y, 
            `avatar_${currentUser.avatarId}`
          )
            .setOrigin(0)
            .setDepth(1)
            .setDisplaySize(1*gridSize,1*gridSize);
          
          // Add physics to player
          this.physics.add.existing(player);
          const playerBody = (player.body as Phaser.Physics.Arcade.Body);
          playerBody.setCollideWorldBounds(false);
          
          // Add collision between player and static objects
          this.physics.add.collider(player, this.staticObjects);
          
          this.players.set(currentUser.id, player);
          
          camera.startFollow(player);
          camera.setFollowOffset(-player.width/2, -player.height/2);
        }

        // Handle websocket events for player movement
        if (wsRef.current) {
          wsRef.current.setHandlers({
            onPositionUpdate: (userId:string, position:any) => {
              const player = this.players.get(userId);
              if (player) {
                player.setPosition(position.x, position.y );
                if (userId === currentUser.id) {
                  camera.startFollow(player, true);
                }
              }
            },
            onUserJoined: (userId:string, position:any, avatar:string) => {
              const player = this.add.image(position.x , position.y, `player_${userId}`)
                .setOrigin(0)
                .setDepth(1)
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

        // Add cursor keys
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Track active movement keys
        let activeKey: string | null = null;

        // Update keyboard handler to prevent diagonal movement
        this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
          if (!currentUser || !currentUser.spawn) return;

          const player = this.players.get(currentUser.id);
          if (!player) return;

          const playerBody = (player.body as Phaser.Physics.Arcade.Body);
          const moveSpeed = gridSize;

          // Only process new key if no key is active or if it's a different key
          if (!activeKey || activeKey !== event.key.toLowerCase()) {
            let newX = this.currentPosition.x;
            let newY = this.currentPosition.y;

            // Stop any existing movement
            playerBody.setVelocity(0, 0);

            switch (event.key.toLowerCase()) {
              case 'arrowup':
              case 'w':
                newY -= 1;
                playerBody.setVelocityY(-moveSpeed);
                activeKey = event.key.toLowerCase();
                break;
              case 'arrowdown':
              case 's':
                newY += 1;
                playerBody.setVelocityY(moveSpeed);
                activeKey = event.key.toLowerCase();
                break;
              case 'arrowleft':
              case 'a':
                newX -= 1;
                playerBody.setVelocityX(-moveSpeed);
                activeKey = event.key.toLowerCase();
                break;
              case 'arrowright':
              case 'd':
                newX += 1;
                playerBody.setVelocityX(moveSpeed);
                activeKey = event.key.toLowerCase();
                break;
            }

            if (newX !== this.currentPosition.x || newY !== this.currentPosition.y) {
              wsRef.current?.send({
                type: 'move',
                x: newX,
                y: newY
              });

              this.currentPosition = { x: newX, y: newY };
            }
          }
        });

        // Update keyup handler to clear active key
        this.input.keyboard!.on('keyup', (event: KeyboardEvent) => {
          const player = this.players.get(currentUser.id);
          if (!player) return;

          const playerBody = (player.body as Phaser.Physics.Arcade.Body);
          
          // Only clear velocity if the released key was the active key
          if (activeKey === event.key.toLowerCase()) {
            switch (event.key.toLowerCase()) {
              case 'arrowup':
              case 'w':
              case 'arrowdown':
              case 's':
                playerBody.setVelocityY(0);
                break;
              case 'arrowleft':
              case 'a':
              case 'arrowright':
              case 'd':
                playerBody.setVelocityX(0);
                break;
            }
            activeKey = null;
          }
        });
      }

      // Add update method for continuous physics
      update() {
        // Update player positions based on physics
        this.players.forEach((player) => {
          const playerBody = (player.body as Phaser.Physics.Arcade.Body);
          if (playerBody) {
            playerBody.velocity.normalize().scale(gridSize);
          }
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
