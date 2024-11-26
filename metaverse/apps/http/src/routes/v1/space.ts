import { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
} from "../../types";
import client from "@repo/db/client";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req: any, res: any) => {
  const parsedData = CreateSpaceSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "invalid request body",
    });
  }
  try {
    if (!parsedData.data.mapId) {
      return res.status(400).json({
        message: "map id is required",
      });
    }
    const map = await client.map.findUnique({
      where: {
        id: parsedData.data.mapId,
      },
      include:{
        elements:{
          select:{
            name:true,
            elementId:true,
            x:true,
            y:true,
            element:{
              select:{
                name:true
              }
            }
          }
        }
      }
    });
    
    if (!map) {
      return res.status(400).json({
        message: "map not found",
      });
    }
    
    
    try {
      let space = await client.$transaction(async (tx) => {

        const space = await tx.space.create({
          data: {
            name: parsedData.data.name,
            width: map.width,
            height: map.height,
            description: parsedData.data.description,
            capacity: parsedData.data.capacity,
            thumbnail: map.thumbnail,
            adminId: req.userId,
            mapId: parsedData.data.mapId,
            updatedAt: new Date(),
          },
        });

      
        if (map.elements && map.elements.length > 0) {
          await tx.spaceElements.createMany({
            data: map.elements.map((e: any) => ({
              elementId: e.elementId,
              spaceId: space.id,
              x: e.x,
              y: e.y,
              name: e.element.name 
            }))
          });
    
        }

        return space;
      });

      console.log("Transaction completed:", space);
      return res.status(200).json({ space });

    } catch (transactionError) {
      console.error("Transaction Error:", transactionError);
      return res.status(500).json({
        message: "Error creating space",
      });
    }
  } catch (e:any) {
    console.error("Outer Error:", e);
    return res.status(500).json({
      message: "internal server error",
      error: e.message
    });
  }
});
spaceRouter.delete("/:spaceId", userMiddleware, async (req: any, res: any) => {
  try {
    const space = await client.space.findUnique({
      where: {
        id: req.params.spaceId,
      },
    });
    if (!space) {
      return res.status(400).json({
        message: "space not found",
      });
    }
    if (space?.adminId !== req.userId) {
      return res.status(403).json({
        message: "unauthorized",
      });
    }
    await client.space.delete({
      where: {
        id: req.params.spaceId,
      },
    });
    return res.status(200).json({
      message: "space deleted",
    });
  } catch (e) {
    return res.status(500).json({
      message: "internal server error",
    });
  }
});

spaceRouter.get("/all/:userId", userMiddleware, async (req: any, res: any) => {
  try {
    const spaces = await client.space.findMany({
      where: {
        adminId: req.paramsuserId,
      },
    });
    if (!spaces) {
      return res.status(400).json({
        message: "no spaces found",
      });
    }
    return res.status(200).json({
      spaces,
    });
  } catch (e) {
    return res.status(500).json({
      message: "internal server error",
    });
  }
});

spaceRouter.post("/element", userMiddleware, async (req: any, res: any) => {
  const parsedData = AddElementSchema.safeParse(req.body);
  try {
    if (!parsedData.success) {
      return res.status(400).json({
        message: "invalid request body",
      });
    }
    const space = await client.space.findUnique({
      where: {
        id: parsedData.data.spaceId,
        adminId: req.userId,
      },
    });
    if (!space) {
      return res.status(400).json({
        message: "space not found",
      });
    }

    await client.spaceElements.create({
      data: {
        elementId: parsedData.data.elementId,
        spaceId: parsedData.data.spaceId,
        x: parsedData.data.x,
        y: parsedData.data.y,
      },
    });
    return res.status(200).json({
      message: "element added",
    });
  } catch (e) {
    return res.status(500).json({
      message: "internal server error",
    });
  }
});

spaceRouter.delete("/element", userMiddleware, async (req: any, res: any) => {
  const parsedData = DeleteElementSchema.safeParse(req.body);
  try {
    if (!parsedData.success) {
      return res.status(400).json({
        message: "invalid request body",
      });
    }
    const spaceElement = await client.spaceElements.findUnique({
      where: {
        id: parsedData.data.spaceElementId,
      },
      select: {
        space: true,
      },
    });
    if (!spaceElement) {
      return res.status(400).json({
        message: "space element not found",
      });
    }
    if (spaceElement?.space.adminId !== req.userId) {
      return res.status(403).json({
        message: "unauthorized",
      });
    }
    await client.spaceElements.delete({
      where: {
        id: parsedData.data.spaceElementId,
      },
    });
    return res.status(200).json({
      message: "element deleted",
    });
  } catch (e) {
    return res.status(500).json({
      message: "internal server error",
    });
  }
});

spaceRouter.get("/:spaceId", async (req: any, res: any) => {
  try {
    const space = await client.space.findUnique({
      where: {
        id: req.params.spaceId,
      },
      include: {
        elements: {
          include: {
            element: true,
          },
        },
      },
    });
    if (!space) {
      return res.status(400).json({
        message: "space not found",
      });
    }
    return res.status(200).json({
      name:space.name,
      thumbnail:space.thumbnail,    
      description:space.description,
      capacity:space.capacity,
      width:space.width,
      height:space.height,
      elements: space.elements.map((e) => ({
        id: e.id,
        element: {
          id: e.element.id,
          imageUrl: e.element.imageUrl,
          width: e.element.width,
          height: e.element.height,
          static: e.element.static,
        },
      })),
    });
  } catch (e) {
    return res.status(500).json({
      message: "internal server error",
    });
  }
});
