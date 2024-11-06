import {Router} from  "express"
import { userRouter } from "./user"
import { adminRouter } from "./admin"
import { spaceRouter } from "./space"
import { Request,Response } from "express"

export const router = Router()

router.post("/signup", (req: any, res: any) => {
    const body = req.body;
    return res.json({
        message: "signup completed"
    })
})

router.post("/signin",(req:any,res:any)=>{
    return res.json({
        message:"signedin completed"
    })
})

router.get("/avatars",(req:any,res:any)=>{

})

router.get("/elements",(req,res)=>{

})

router.use("/user",userRouter)
router.use("admin",adminRouter)
router.use("space",spaceRouter)

