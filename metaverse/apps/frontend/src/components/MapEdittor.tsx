import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import axios from 'axios';
import { FiZoomIn, FiZoomOut, FiSave, FiTrash2, FiMove } from 'react-icons/fi';

interface Element {
  id: number;
  imageUrl: string;
  name: string;
  width: number;
  height: number;
  static: boolean;
}

const MapEditor = () => {
  const phaserRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch elements from backend
  useEffect(() => {
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
    fetchElements();
  }, []);

  useEffect(() => {
    if (!phaserRef.current) return;

    class MapScene extends Phaser.Scene {
      private placedElements: Phaser.GameObjects.Image[] = [];
      private dragPreview: Phaser.GameObjects.Image | null = null;
      private grid: Phaser.GameObjects.Grid | null = null;
      private cameras: Phaser.Cameras.Scene2D.Camera | null = null;

      constructor() {
        super({ key: 'MapScene' });
      }

      preload() {
        // Load all element images with error handling
        elements.forEach(element => {
          this.load.image(`element_${element.id}`, element.imageUrl);
        });
        
        // Add loading error handler
        this.load.on('loaderror', (fileObj: any) => {
          console.error('Error loading asset:', fileObj.src);
        });
      }

      create() {
        // Create grid
        const gridSize = 32;
        const width = 1600;
        const height = 1200;

        // Add background grid
        for (let x = 0; x < width; x += gridSize) {
          for (let y = 0; y < height; y += gridSize) {
            this.add.rectangle(x, y, gridSize, gridSize)
              .setStrokeStyle(1, 0xcccccc)
              .setOrigin(0);
          }
        }

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
              .setInteractive({ draggable: true }) // Enable dragging directly
              .setDepth(1); // Ensure elements appear above grid

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
      }

      updateDragPreview() {
        if (this.dragPreview) {
          this.dragPreview.destroy();
        }
        if (selectedElement) {
          this.dragPreview = this.add.image(0, 0, `element_${selectedElement.id}`)
            .setOrigin(0)
            .setAlpha(0.5)
            .setDepth(2) // Keep preview above other elements
            .setVisible(false);
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
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, [elements, selectedElement, zoom]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Element Palette - Now with responsive sidebar */}
      <div className="w-full md:w-80 lg:w-96 bg-gray-800 p-4 md:p-6 overflow-y-auto border-b md:border-r border-gray-700/50 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
          <span className="bg-blue-500 w-2 h-8 rounded-full"></span>
          Elements Library
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {elements.map((element) => (
            <div
              key={element.id}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                selectedElement?.id === element.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-xl shadow-blue-500/20'
                  : 'bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-sm'
              }`}
              onClick={() => setSelectedElement(element)}
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
              const scene = gameRef.current?.scene.getScene('MapScene') as any;
              const mapData = {
                width: 1600,
                height: 1200,
                elements: scene.placedElements.map((el: any) => ({
                  elementId: parseInt(el.texture.key.split('_')[1]),
                  x: el.x,
                  y: el.y,
                })),
              };
              console.log('Map Data:', mapData);
            }}
          >
            <FiSave size={20} className="group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">Save Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapEditor;
