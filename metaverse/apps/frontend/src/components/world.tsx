import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { GameWebSocket } from "@/services/web-socket";
import { logger } from "@/utils/logger";
import { WorldProps, PlayerSprite, Position } from "@/types";

const World = ({ config }: WorldProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const wsRef = useRef<GameWebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new GameWebSocket({
      url: "ws://localhost:8080",
      debug: true,
    });
  }, []);

  useEffect(() => {
    class MainScene extends Phaser.Scene {
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      private wasd!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
      };
      private player!: PlayerSprite;
      private otherPlayers: Map<string, PlayerSprite> = new Map();
      private mapLayers!: {
        below: Phaser.Tilemaps.TilemapLayer | null;
        world: Phaser.Tilemaps.TilemapLayer | null;
        above: Phaser.Tilemaps.TilemapLayer | null;
      };
      private lastPosition: Position = { x: 0, y: 0 };
      private lastMoveTime: number = 0;
      private moveThrottle: number = 50;

      constructor() {
        super({ key: "MainScene" });
      }

      init() {
        if (!this.input.keyboard?.createCursorKeys()) {
          Error("createCursorKeys function is not there in input keyboard");
          return;
        }
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys({
          W: Phaser.Input.Keyboard.KeyCodes.W,
          A: Phaser.Input.Keyboard.KeyCodes.A,
          S: Phaser.Input.Keyboard.KeyCodes.S,
          D: Phaser.Input.Keyboard.KeyCodes.D,
        }) as {
          W: Phaser.Input.Keyboard.Key;
          A: Phaser.Input.Keyboard.Key;
          S: Phaser.Input.Keyboard.Key;
          D: Phaser.Input.Keyboard.Key;
        };
      }

      private setupWebSocketHandlers() {
        if (!wsRef.current) return;

        wsRef.current.setHandlers({
          onConnect: () => {
            logger.success("Connected to game server");
          },
          onSpaceJoined: (spawn, users) => {
            logger.info("SPACE JOINED  - WS Handler");
            this.handleSpaceJoined(spawn, users);
          },
          onUserJoined: (userId, position) => {
            logger.info("USER JOINED  - WS Handler");
            this.createOtherPlayer(userId, position);
          },
          onUserLeft: (userId) => {
            logger.info("USER LEFT  - WS Handler");
            this.handleUserLeft(userId);
          },
          onPositionUpdate: (userId, position) => {
            logger.info("POSITION UPDATE  - WS Handler");
            this.handlePlayerMove(userId, position);
          },
          onEmote: (userId, emote) => {
            logger.info("EMOTE  - WS Handler");
            this.handleEmote(userId, emote);
          },
        });

        wsRef.current
          .connect(config.spaceId, config.token)
          .catch(console.error);
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
        this.createMap();
        this.createAnimations();
        this.player = this.createPlayer(0, 0, config.username);

        if (wsRef.current) {
          this.setupWebSocketHandlers();
        }
      }

      private createMap() {
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage(
          "tuxmon-sample-32px-extruded",
          "tiles"
        );

        if (!tileset) {
          throw new Error("Failed to load tileset");
        }

        this.mapLayers = {
          below: map.createLayer("Below Player", tileset, 0, 0),
          world: map.createLayer("World", tileset, 0, 0),
          above: map.createLayer("Above Player", tileset, 0, 0),
        };

        if (!this.mapLayers.world || !this.mapLayers.above) {
          throw new Error("Failed to create layers");
        }

        this.mapLayers.world.setCollisionByProperty({ collides: true });
        this.mapLayers.above.setDepth(10);

        const { width, height, tileWidth, tileHeight } = map;
        const totalWidthInPixels = width * tileWidth;
        const totalHeightInPixels = height * tileHeight;
        logger.info("Map dimensions:", {
          tilesWide: width,
          tilesHigh: height,
          tileWidth,
          tileHeight,
          totalWidthInPixels,
          totalHeightInPixels,
        });
      }

      private createAnimations() {
        const anims = [
          { key: "misa-left-walk", prefix: "misa-left-walk." },
          { key: "misa-right-walk", prefix: "misa-right-walk." },
          { key: "misa-front-walk", prefix: "misa-front-walk." },
          { key: "misa-back-walk", prefix: "misa-back-walk." },
        ];

        anims.forEach(({ key, prefix }) => {
          this.anims.create({
            key,
            frames: this.anims.generateFrameNames("atlas", {
              prefix,
              start: 0,
              end: 3,
              zeroPad: 3,
            }),
            frameRate: 10,
            repeat: -1,
          });
        });
      }

      private createPlayer(
        x: number,
        y: number,
        username: string
      ): PlayerSprite {
        const player = this.physics.add.sprite(
          x,
          y,
          "atlas",
          "misa-front"
        ) as PlayerSprite;
        player.setSize(30, 40).setOffset(0, 24);

        // Add username text
        const nameText = this.add.text(x, y - 40, username, {
          fontSize: "14px",
          backgroundColor: "#00000080",
          padding: { x: 4, y: 2 },
          color: "#ffffff",
        });
        nameText.setOrigin(0.5);
        player.nameText = nameText;

        if (this.mapLayers.world) {
          this.physics.add.collider(player, this.mapLayers.world);
        }

        return player;
      }

      private createOtherPlayer(userId: string, position: Position) {
        const sprite = this.createPlayer(
          position.x,
          position.y,
          Player ${userId}
        );
        sprite.userId = userId;
        this.otherPlayers.set(userId, sprite);
      }

      private handleSpaceJoined(spawn: Position, users: any[]) {
        this.player.setPosition(spawn.x, spawn.y);
        this.cameras.main.startFollow(this.player);

        users.forEach((user) => {
          this.createOtherPlayer(user.id, user.position);
        });
      }

      private handleUserLeft(userId: string) {
        const player = this.otherPlayers.get(userId);
        if (player) {
          player.nameText?.destroy();
          player.destroy();
          this.otherPlayers.delete(userId);
        }
      }

      private handlePlayerMove(userId: string, position: Position) {
        const player = this.otherPlayers.get(userId);
        if (player) {
          this.tweens.add({
            targets: player,
            x: position.x,
            y: position.y,
            duration: 100,
            ease: "Linear",
            onUpdate: () => {
              if (player.nameText) {
                player.nameText.setPosition(player.x, player.y - 40);
              }
            },
          });
        }
      }

      private handleEmote(userId: string, emote: string) {
        const player = this.otherPlayers.get(userId);
        if (player?.emoteText) {
          player.emoteText.setText(emote);
          this.time.delayedCall(2000, () => {
            if (player.emoteText) {
              player.emoteText.setText("");
            }
          });
        }
      }

      update(time: number) {
        if (!this.player) {
          Error("Player is not defined");
          return;
        }

        const speed = 175;
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const prevVelocity = body.velocity.clone();

        body.setVelocity(0);

        const left = this.cursors.left.isDown || this.wasd.A.isDown;
        const right = this.cursors.right.isDown || this.wasd.D.isDown;
        const up = this.cursors.up.isDown || this.wasd.W.isDown;
        const down = this.cursors.down.isDown || this.wasd.S.isDown;

        if (left) {
          body.setVelocityX(-speed);
        } else if (right) {
          body.setVelocityX(speed);
        }

        if (up) {
          body.setVelocityY(-speed);
        } else if (down) {
          body.setVelocityY(speed);
        }

        body.velocity.normalize().scale(speed);

        if (left) {
          this.player.anims.play("misa-left-walk", true);
        } else if (right) {
          this.player.anims.play("misa-right-walk", true);
        } else if (up) {
          this.player.anims.play("misa-back-walk", true);
        } else if (down) {
          this.player.anims.play("misa-front-walk", true);
        } else {
          this.player.anims.stop();

          if (prevVelocity.x < 0) this.player.setTexture("atlas", "misa-left");
          else if (prevVelocity.x > 0)
            this.player.setTexture("atlas", "misa-right");
          else if (prevVelocity.y < 0)
            this.player.setTexture("atlas", "misa-back");
          else if (prevVelocity.y > 0)
            this.player.setTexture("atlas", "misa-front");
        }

        if (this.player.nameText) {
          this.player.nameText.setPosition(this.player.x, this.player.y - 40);
        }

        // if (
        //   wsRef.current &&
        //   time - this.lastMoveTime > this.moveThrottle &&
        //   (this.lastPosition.x !== this.player.x ||
        //     this.lastPosition.y !== this.player.y)
        // ) {
        //   this.lastMoveTime = time;
        //   this.lastPosition = { x: this.player.x, y: this.player.y };
        //   wsRef.current.move(this.lastPosition);
        // }

        if (wsRef.current) {
          // this.lastMoveTime = time;
          logger.info("Move function on WS called -> ", {
            lastPosition: this.lastPosition,
            x: this.player.x,
            y: this.player.y,
          });
          this.lastPosition = { x: this.player.x, y: this.player.y };
          wsRef.current.move(this.lastPosition);
        }
      }
    }

    const gameConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 700,
      height: 700,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      parent: "game-container",
      pixelArt: true,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: true,
        },
      },
      scene: MainScene,
    };

    window.addEventListener("resize", () => {
      gameRef.current!.scale.resize(window.innerWidth, window.innerHeight);
    });

    gameRef.current = new Phaser.Game(gameConfig);
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [config.spaceId]);

  return (
    <div
      id="game-container"
      className="flex w-full h-full justify-center items-center"
    ></div>
  );
};

export default World