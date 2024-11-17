import React, { useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import localimage from "../assets/DMV - Office.jpg";

const PhaserMultiplayer = () => {
  const gameRef = useRef(null);
  const [players, setPlayers] = React.useState({
    self: { id: "self", name: "You" },
    user1: { id: "user1", name: "Alice" },
    user2: { id: "user2", name: "Bob" },
    user3: { id: "user3", name: "Saksham" },
  });

  useEffect(() => {
    const loadPhaser = async () => {
      if (typeof window !== "undefined") {
        const Phaser = (await import("phaser")).default;

        class MainScene extends Phaser.Scene {
          constructor() {
            super({ key: "MainScene" });
            this.players = new Map();
            this.playerTexts = new Map();
          }

          preload() {
            this.load.image(
              "tiles",
              "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png"
            );
            this.load.tilemapTiledJSON(
              "map",
              "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilemaps/tuxemon-town.json"
            );
            this.load.atlas(
              "atlas",
              "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.png",
              "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.json"
            );
          }

          create() {
            const mapWidth = 1000,
              mapHeight = 1000,
              tileSize = 64;
            const graphics = this.add.graphics();
            graphics.lineStyle(1, 0xcccccc);
            this.add.image(0, 0, "tiles").setOrigin(0, 0).setScale(1);

            for (let x = 0; x <= mapWidth; x++) {
              graphics.moveTo(x * tileSize, 0);
              graphics.lineTo(x * tileSize, mapHeight * tileSize);
            }
            for (let y = 0; y <= mapHeight; y++) {
              graphics.moveTo(0, y * tileSize);
              graphics.lineTo(mapWidth * tileSize, y * tileSize);
            }
            graphics.strokePath();

            this.physics.world.setBounds(
              0,
              0,
              mapWidth * tileSize,
              mapHeight * tileSize
            );
            this.initializePlayers();
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = {
              up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
              down: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.S
              ),
              left: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.A
              ),
              right: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.D
              ),
            };
            const localPlayer = this.players.get("self");
            if (localPlayer) {
              this.cameras.main.startFollow(localPlayer);
              this.cameras.main.setZoom(1);
            }
            this.checkPlayerInteractions();
          }

          initializePlayers() {
            const localPlayer = this.createPlayer(
              "self",
              400,
              300,
              0x3b82f6,
              "You"
            );
            this.players.set("self", localPlayer);
            const otherPlayers = [
              { id: "user1", name: "Alice", color: 0x10b981, x: 200, y: 200 },
              { id: "user2", name: "Bob", color: 0xf59e0b, x: 600, y: 400 },
            ];
            otherPlayers.forEach((player) => {
              const otherPlayer = this.createPlayer(
                player.id,
                player.x,
                player.y,
                player.color,
                player.name
              );
              this.players.set(player.id, otherPlayer);
            });
          }

          createPlayer(id, x, y, color, name) {
            const player = this.add.circle(x, y, 25, color);
            this.physics.add.existing(player);
            player.body.setCollideWorldBounds(true);
            player.playerId = id;
            const playerText = this.add
              .text(x, y - 35, name, {
                font: "16px Arial",
                color: "#000000",
              })
              .setOrigin(0.5);
            this.playerTexts.set(id, playerText);
            const interactionCircle = this.add.circle(x, y, 100, color, 0);
            interactionCircle.setStrokeStyle(2, color, 0.5);
            interactionCircle.setVisible(false);
            player.interactionCircle = interactionCircle;
            return player;
          }

          checkPlayerInteractions() {
            const INTERACTION_DISTANCE = 100;
            const localPlayer = this.players.get("self");
            this.players.forEach((otherPlayer, id) => {
              if (id !== "self") {
                const distance = Phaser.Math.Distance.Between(
                  localPlayer.x,
                  localPlayer.y,
                  otherPlayer.x,
                  otherPlayer.y
                );
                if (distance < INTERACTION_DISTANCE) {
                  otherPlayer.interactionCircle.setVisible(true);
                  otherPlayer.interactionCircle.setAlpha(
                    1 - distance / INTERACTION_DISTANCE
                  );
                } else {
                  otherPlayer.interactionCircle.setVisible(false);
                }
              }
            });
          }

          update() {
            const localPlayer = this.players.get("self");
            if (!localPlayer) return;
            const speed = 200;
            let velocityX = 0,
              velocityY = 0;
            if (this.cursors.left.isDown || this.wasd.left.isDown) {
              velocityX = -speed;
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
              velocityX = speed;
            }
            if (this.cursors.up.isDown || this.wasd.up.isDown) {
              velocityY = -speed;
            } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
              velocityY = speed;
            }
            localPlayer.body.setVelocity(velocityX, velocityY);
            this.players.forEach((player, id) => {
              const text = this.playerTexts.get(id);
              if (text) {
                text.setPosition(player.x, player.y - 35);
              }
              if (player.interactionCircle) {
                player.interactionCircle.setPosition(player.x, player.y);
              }
            });
            this.checkPlayerInteractions();
            if (velocityX !== 0 || velocityY !== 0) {
              console.log("Player moved:", {
                x: localPlayer.x,
                y: localPlayer.y,
              });
            }
          }
        }

        const config = {
          type: Phaser.AUTO,
          parent: "phaser-container",
          width: window.innerWidth,
          height: window.innerHeight,
          physics: {
            default: "arcade",
            arcade: {
              gravity: { y: 0 },
              debug: false,
            },
          },
          scene: MainScene,
          backgroundColor: "#f9fafb",
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        const handleResize = () => {
          game.scale.resize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          game.destroy(true);
        };
      }
    };

    loadPhaser();
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div
        id="phaser-container"
        className="absolute inset-0 max-width-full max-height-full"
        style={{ backgroundColor: "#e5e7eb" }}
      />
      <div className="absolute top-4 left-4 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h2 className="font-bold mb-2 text-lg">Online Users</h2>
        <ul className="space-y-2">
          {Object.values(players).map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition duration-200"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    player.id === "self"
                      ? "#3b82f6"
                      : player.id === "user1"
                        ? "#10b981"
                        : "#f59e0b",
                }}
              />
              {player.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-4">
        <button className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-200 transition duration-200">
          <Camera className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default PhaserMultiplayer;
