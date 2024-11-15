import { WebSocket } from "ws";
import { OutgoingMessage } from "./types";
import { RoomManager } from "./RoomManager";
import client from "@repo/db/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

function getRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export class User {
  public id: string;
  public userId?: string;
  private spaceId?: string;
  private x: number;
  private y: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.id = getRandomId();
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.initHandler();
  }

  initHandler() {
    this.ws.on("message", async (data) => {
      const parsedData = JSON.parse(data.toString());
      switch (parsedData.type) {
        case "join":
          const spaceId = parsedData.spaceId;
          const token = parsedData.token;
          const userId = (jwt.verify(token, JWT_SECRET) as JwtPayload).id;
          if (!userId) {
            this.ws.close();
            return;
          }
          this.userId = userId;
          const space = await client.space.findUnique({
            where: {
              id: spaceId,
            },
          });
          if (!space) {
            this.ws.close();
            return;
          }

          this.spaceId = spaceId;

          RoomManager.getInstance().addUser(spaceId, this);
          this.x = Math.floor(Math.random() * space.width!);
          this.y = Math.floor(Math.random() * space.height!);
          this.send({
            type: "space-joined",
            payload: {
              //chedk the notion doc here we need tos end the spaw points so get back to this later for static objects checking
              spawn: {
                x: this.y,
                y: this.x,
              },
              users:
                RoomManager.getInstance()
                  .rooms.get(spaceId)
                  ?.map((u) => ({ id: u.id })) ?? [],
            },
          });
          break;
        case "move":
          const movex = parsedData.x;
          const movey = parsedData.y;
          const xdisplacement = Math.abs(this.x - movex);
          const ydisplacement = Math.abs(this.y - movey);
          if (
            (xdisplacement === 1 && ydisplacement == 0) ||
            (xdisplacement == 0 && ydisplacement === 1)
          ) {
            this.x = movex;
            this.y = movey;

            RoomManager.getInstance().broadcast(
              {
                type: "movement",
                payload: {
                  x: this.x,
                  y: this.y,
                },
              },
              this,
              this.spaceId!
            );
            return;
          }
          this.send({
            tppe: "movement-rejected",
            payload: {
              x: this.x,
              y: this.y,
            },
          });
      }
    });
  }

  destroy() {
    RoomManager.getInstance().broadcast(
      {
        type: "user-left",
        payload: {
          userId: this.id,
        },
      },
      this,
      this.spaceId!
    );
    RoomManager.getInstance().removeUser(this.spaceId!, this);
  }

  send(payload: OutgoingMessage) {
    this.ws.send(JSON.stringify(payload));
  }
}
