import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";
import { adminMiddleware } from "../../middleware/admin";
export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req: any, res: any) => {
  const parsedData = UpdateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "invalid data",
    });
  }
  try {
    const user = await client.user.findUnique({
      where: {
        id: req.userId,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "user not found",
      });
    }
    await client.user.update({
      where: { id: req.userId },
      data: { avatarId: parsedData.data.avatarId },
    });
    return res.status(200).json({
      message: "metadata updated",
    });
  } catch (e) {
    return res.status(400).json({
      message: "internal server error",
    });
  }
});

userRouter.get("/metadata/bulk", userMiddleware, async (req: any, res: any) => {
  try {
    const metadata = await client.avatar.findMany({
    });
    return res.status(200).json({
      avatars:metadata
    });
  } catch (e) {
    return res.status(400).json({
      message: "internal server error",
    });
  }
});

userRouter.get("/metadata/:userId",userMiddleware,async(req:any,res:any)=>{
  try{
    const user = await client.user.findUnique({
      where:{id:req.params.userId},
      include:{
        avatar:{
          select:{
            id:true,
            imageUrl:true
          }
        }
      }
    })
    if(!user){
      return res.status(400).json({
        message:"user not found"
      })
    }
    return res.status(200).json({
      user:user
    })
  }catch(e){
    return res.status(400).json({
      message:"internal server error"
    })
  }
})

userRouter.get("/maps", userMiddleware, async (req: any, res: any) => {
  try{
    const maps = await client.map.findMany({
      include:{
        elements:{
          include:{
            element:true
          }
        }
      }
    })
    return res.status(200).json({
      maps:maps
    })
  }catch(e){
    return res.status(400).json({
      message:"internal server error"
    })
  }
});
