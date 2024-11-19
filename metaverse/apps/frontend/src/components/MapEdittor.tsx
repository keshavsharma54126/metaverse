import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const MapEditor = () => {
    const phaserRef = useRef(null); // Ref to attach Phaser canvas
    const [placedElements, setPlacedElements] = useState([]); // Track placed elements
    const [selectedElement, setSelectedElement] = useState(null); // Selected element from palette

    const gridSize = 32;

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 800, // Grid width
            height: 600, // Grid height
            backgroundColor: '#eeeeee',
            parent: phaserRef.current,
            scene: {
                preload: preload,
                create: create,
            },
        };

        const game = new Phaser.Game(config);

        function preload() {
            // Load static assets
            this.load.image('grid', 'path/to/grid-tile.png');
            this.load.image('tree', 'path/to/tree.png');
            this.load.image('rock', 'path/to/rock.png');
        }

        function create() {
            // Draw grid
            const rows = Math.ceil(this.sys.game.config.height / gridSize);
            const cols = Math.ceil(this.sys.game.config.width / gridSize);

            for (let x = 0; x < cols * gridSize; x += gridSize) {
                for (let y = 0; y < rows * gridSize; y += gridSize) {
                    this.add
                        .rectangle(x, y, gridSize, gridSize)
                        .setStrokeStyle(1, 0xaaaaaa)
                        .setOrigin(0);
                }
            }

            // Handle clicks to place elements
            this.input.on('pointerdown', (pointer) => {
                if (selectedElement) {
                    const x = Math.floor(pointer.x / gridSize) * gridSize;
                    const y = Math.floor(pointer.y / gridSize) * gridSize;

                    const placed = this.add.image(x, y, selectedElement).setOrigin(0);
                    setPlacedElements((prev) => [
                        ...prev,
                        { texture: selectedElement, x, y },
                    ]);
                }
            });
        }

        return () => {
            game.destroy(true); // Cleanup Phaser game on component unmount
        };
    }, [selectedElement]);

    // Save map data
    const saveMap = () => {
        const mapData = {
            width: 800,
            height: 600,
            elements: placedElements,
        };

        console.log('Map saved:', mapData);

        // Example: Send to API
        // fetch('/api/save-map', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(mapData),
        // })
        // .then((res) => res.json())
        // .then((data) => console.log('Saved map data:', data))
        // .catch((err) => console.error('Save error:', err));
    };

    return (
        <div style={{ display: 'flex' }}>
            {/* Sidebar for selecting elements */}
            <div style={{ width: '200px', background: '#f4f4f4', padding: '10px' }}>
                <h3>Element Palette</h3>
                <div onClick={() => setSelectedElement('tree')} style={{ cursor: 'pointer' }}>
                    <img src="path/to/tree.png" alt="Tree" style={{ width: '50px' }} />
                </div>
                <div onClick={() => setSelectedElement('rock')} style={{ cursor: 'pointer' }}>
                    <img src="path/to/rock.png" alt="Rock" style={{ width: '50px' }} />
                </div>
                <button onClick={saveMap} style={{ marginTop: '20px' }}>
                    Save Map
                </button>
            </div>

            {/* Phaser canvas */}
            <div ref={phaserRef} style={{ flex: 1 }} />
        </div>
    );
};

export default MapEditor;
