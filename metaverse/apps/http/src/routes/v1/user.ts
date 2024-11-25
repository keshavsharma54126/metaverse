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

userRouter.get("/metadata/bulk", adminMiddleware, async (req: any, res: any) => {
  const userIds = (req.query.userIds ?? "[]") as string;
  const parsedUserIds = userIds.slice(1, userIds?.length - 2).split(",");
  try {
    const metadata = await client.user.findMany({
      where: {
        id: {
          in: parsedUserIds,
        },
      },
      select: {
        avatar: true,
        id: true,
      },
    });
    return res.status(200).json({
      avatars: metadata.map((user) => ({
        userId: user.id,
        avatarId: user.avatar?.imageUrl,
      })),
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