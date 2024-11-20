import {Router} from "express"
import { adminMiddleware } from "../../middleware/admin"
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types";
import client from "@repo/db/client"
 
export const adminRouter = Router()

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
                imageUrl:parsedData.data?.imageUrl!
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

adminRouter.post("/map",adminMiddleware,async(req:any,res:any)=>{
    try{
        const parsedData = CreateMapSchema.safeParse(req.body)
        if(!parsedData){
            return res.status(400).json({
                message:"invalid data"
            })
        }
        const map = await client.map.create({
            data:{
                thumbnail:parsedData.data?.thumbnail!,
                width:parseInt(parsedData.data?.dimessions.split("X")[0]!),
                height:parseInt(parsedData.data?.dimessions.split("X")[1]!),
                name:parsedData.data?.name!,
                elements:{
                    create:parsedData.data?.defaultElements!.map((element:any)=>({
                        elementId:element.elementId,
                        x:element.x,
                        y:element.y
                    }))
                }
            }
        })
        return res.json({
            id:map.id
        })
    }catch(e){
        return res.status(400).json({
            message:"internal server error"
        })
    }
})