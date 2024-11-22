import {Router} from "express"
import { adminMiddleware } from "../../middleware/admin"
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema, UpdateMapSchema } from "../../types";
import client from "@repo/db/client"
 
export const adminRouter = Router()

adminRouter.get("/elements", adminMiddleware, async (req: any, res: any) => {
    const elements = await client.element.findMany();
    return res.json({
      elements: elements.map((e) => ({
        id: e.id,
        name:e.name,
        width: e.width,
        height: e.height,
        imageUrl: e.imageUrl,
        static: e.static,
      })),
    });
  });

adminRouter.post("/element", adminMiddleware, async (req: any, res: any) => {
  const parsedData = CreateElementSchema.safeParse(req.body);
  if(!parsedData){
    return res.status(400).json({
        message:"invalid data"
    })
  }
  try{
    const element = await client.element.create({
        data:{
            name:parsedData.data?.name!,
            imageUrl:parsedData.data?.imageUrl!     ,
            width:parsedData.data?.width!,
            height:parsedData.data?.height!,
            static:parsedData.data?.static!
        }
      })
      return res.json({
        id:element.id
      })
  }catch(e){
    return res.status(500).json({
        message:"internal server error"
    })
  }


});

adminRouter.put("/element/:elementId",adminMiddleware,async(req:any,res:any)=>{
    const parsedData = UpdateElementSchema.safeParse(req.body)
    if(!parsedData){
        return res.status(400).json({
            message:"invalid data"
        })
    }
    try{
        const existingElement = await client.element.findUnique({
            where:{
                id:req.params.elementId
            }
        })
        if(!existingElement){
            return res.status(400).json({
                message:"element not found"
            })
        }
        const updatedElement = await client.element.update({
            where:{
                id:req.params.elementId,
            },
            data:{
                name:parsedData.data?.name!,
                imageUrl:parsedData.data?.imageUrl!,
                width:parsedData.data?.width!,
                height:parsedData.data?.height!,
                static:parsedData.data?.static!
            }
        })
        return res.json({
            id:updatedElement.id
        })
    }catch(e){
        return res.status(400).json({
            message:"internal server error"
        })
    }
})

adminRouter.delete("/element/:elementId", adminMiddleware, async (req: any, res: any) => {
    try {
        const existingElement = await client.element.findUnique({
            where: {
                id: req.params.elementId
            }
        });
        if (!existingElement) {
            return res.status(404).json({
                message: "element not found"
            });
        }
        await client.element.delete({
            where: {
                id: req.params.elementId,
            },
        });
        return res.json({
            message: "element deleted"
        });
    } catch (e) {
        return res.status(500).json({
            message: "internal server error"
        });
    }
});


adminRouter.put("/avatar/:avatarId",adminMiddleware,async(req:any,res:any)=>{
    try{
        const {avatarName,avatarImageUrl}=req.body;
        
        const existingAvatar = await client.avatar.findUnique({
            where:{
                id:req.params.avatarId
            }
        })
        
        if(!existingAvatar){
            return res.status(400).json({
                message:"element not found"
            })
        }

        const updatedAvatar = await client.avatar.update({
            where:{
                id:req.params.avatarId,
            },
            data:{
                name:avatarName,
                imageUrl:avatarImageUrl
            }
        })
       
        return res.json({
            id:updatedAvatar.id
        })
    }catch(e){
        return res.status(400).json({
            message:"internal server error"
        })
    }
})


adminRouter.delete("/avatar/:avatarId",adminMiddleware,async(req:any,res:any)=>{
    try{
        const existingAvatar = await client.avatar.findUnique({
            where:{
                id:req.params.avatarId
            }
        })
        if(!existingAvatar){
            return res.status(400).json({
                message:"element not found"
            })
        }
         await client.avatar.delete({
            where:{
                id:req.params.avatarId,
            },
        })
        return res.json({
            message:"avatar deleted"
        })
    }catch(e){
        return res.status(400).json({
            message:"internal server error"
        })
    }
})

adminRouter.get("/avatars", adminMiddleware, async (req: any, res: any) => {
    const avatars = await client.avatar.findMany();
    return res.json({
      avatars: avatars.map((a) => ({
        id: a.id,
        name: a.name,
        imageUrl: a.imageUrl,
      })),
    });
  });

adminRouter.post("/avatar",adminMiddleware,async(req:any,res:any)=>{
    try{
        const parsedData = CreateAvatarSchema.safeParse(req.body)
        if(!parsedData){
            return res.status(400).json({
                message:"invalid data"
            })
        }
        const avatar = await client.avatar.create({
            data:{
                imageUrl:parsedData.data?.imageUrl!,
                name:parsedData.data?.name!
            }
        })
        return res.json({
            id:avatar.id
        })

    }catch(e){
        return res.status(400).json({
            message:"internal server error"
        })
    }
})

adminRouter.get("/maps", adminMiddleware, async (req: any, res: any) => {
  const maps = await client.map.findMany();
  return res.json({
    maps: maps.map((m) => ({
      id: m.id,
      name: m.name,
      thumbnail: m.thumbnail,
      width: m.width,
      height: m.height,
     
    })),
  });
});
adminRouter.get("/maps/:mapId",adminMiddleware,async(req:any,res:any)=>{
  const map = await client.map.findUnique({
    where:{
      id:req.params.mapId
    }
  })

  return res.json({
    map:map
  })
})

adminRouter.post("/map", adminMiddleware, async (req: any, res: any) => {
  const parsedData = CreateMapSchema.safeParse(req.body);
  
  if (!parsedData) {
    return res.status(400).json({
      message: "invalid data"
    });
  }
  try {
    if (!parsedData.data?.dimensions) {
      throw new Error("Dimensions are required");
    }
    const dimensions = parsedData.data.dimensions.split("x");
    if (dimensions.length !== 2) {
      throw new Error("Invalid dimensions format");
    }
    const height = parseInt(dimensions[1]);
    const width = parseInt(dimensions[0]);
    if (isNaN(height) || isNaN(width)) {
      throw new Error("Invalid dimensions values");
    }
    const map = await client.map.create({
      data: {
        name: parsedData.data.name!,
        thumbnail: parsedData.data?.thumbnail!,
        width: width,
        height: height,
       
      }
    });
    return res.json({
      id: map.id
    });
  } catch (e) {
    return res.status(500).json({
      message: "internal server error"
    });
  }
});

adminRouter.put("/map/:mapId", adminMiddleware, async (req: any, res: any) => {
  const parsedData = UpdateMapSchema.safeParse(req.body);
  
  if (!parsedData) {
    return res.status(400).json({
      message: "invalid data"
    });
  }

  try {
     
        if (!parsedData.data?.dimensions) {
          throw new Error("Dimensions are required");
        }
        const dimensions = parsedData.data.dimensions.split("x");
        if (dimensions.length !== 2) {
          throw new Error("Invalid dimensions format");
        }
        const height = parseInt(dimensions[1]);
        const width = parseInt(dimensions[0]);
        
        if (isNaN(height) || isNaN(width)) {
          throw new Error("Invalid dimensions values");
        }
    const existingMap = await client.map.findUnique({
      where: {
        id: req.params.mapId
      }
    });
  
    if (!existingMap) {
      return res.status(400).json({
        message: "map not found"
      });
    }
    const updatedMap = await client.map.update({
      where: {
        id: req.params.mapId,
      },
      data: {
        name: parsedData.data?.name!,
        thumbnail: parsedData.data?.thumbnail!,
        width: width,
        height: height,
      }
    });
    return res.json({
      id: updatedMap.id
    });
  } catch (e) {
    return res.status(500).json({
      message: "internal server error"
    });
  }
});

adminRouter.delete("/map/:mapId", adminMiddleware, async (req: any, res: any) => {
  try {
    await client.map.delete({
      where: {
        id: req.params.mapId
      }
    });
    return res.json({
      message: "success"
    });
  } catch (e) {
    return res.status(500).json({
      message: "internal server error"
    });
  }
});

