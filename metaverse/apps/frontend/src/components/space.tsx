import  { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

const MultiplayerSpace = () => {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState({
    // Mock data - in real app this would come from WebSocket
    self: { id: 'self', x: 400, y: 300, name: 'You', color: '#3b82f6' },
    user1: { id: 'user1', x: 200, y: 200, name: 'Alice', color: '#10b981' },
    user2: { id: 'user2', x: 600, y: 400, name: 'Bob', color: '#f59e0b' },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size 
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Set up keyboard controls
    const keys = new Set();
    const handleKeyDown = (e) => keys.add(e.key);
    const handleKeyUp = (e) => keys.delete(e.key);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    let animationFrameId;
    const SPEED = 5;

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background grid
      ctx.strokeStyle = '#e5e7eb';
      const gridSize = 32;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update self position based on keys
      setPlayers(prevPlayers => {
        const newPlayers = { ...prevPlayers };
        if (keys.has('ArrowLeft') || keys.has('a')) newPlayers.self.x -= SPEED;
        if (keys.has('ArrowRight') || keys.has('d')) newPlayers.self.x += SPEED;
        if (keys.has('ArrowUp') || keys.has('w')) newPlayers.self.y -= SPEED;
        if (keys.has('ArrowDown') || keys.has('s')) newPlayers.self.y += SPEED;
        
        // Here you would emit the position update to other players via WebSocket
        
        return newPlayers;
      });

      // Draw all players
      Object.values(players).forEach(player => {
        // Draw player circle
        ctx.beginPath();
        ctx.fillStyle = player.color;
        ctx.arc(player.x, player.y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Draw player name
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x, player.y - 35);

        // Draw interaction radius (when players are close)
        const INTERACTION_RADIUS = 100;
        if (player.id !== 'self') {
          const distance = Math.hypot(
            players.self.x - player.x,
            players.self.y - player.y
          );
          
          if (distance < INTERACTION_RADIUS) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 - (distance / INTERACTION_RADIUS) * 0.5})`;
            ctx.arc(player.x, player.y, INTERACTION_RADIUS, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [players]);

  return (
    <div className="relative w-full h-screen bg-gray-50">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
        <h2 className="font-bold mb-2">Online Users</h2>
        <ul className="space-y-2">
          {Object.values(players).map(player => (
            <li key={player.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: player.color }}
              />
              {player.name}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="absolute bottom-4 right-4 flex gap-4">
        <button 
          className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-100"
        >
          <Camera className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default MultiplayerSpace;