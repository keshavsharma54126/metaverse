import { Router } from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { SigninSchema, SignupSchema } from "../../types";
import client from "@repo/db/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { userMiddleware } from "../../middleware/user";

export const router = Router();

router.post("/signup", async (req: any, res: any) => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success)
    return res.status(400).json({
      message: "invalid data",
    });
  const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
  try {
    const existingUser = await client.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });
    if (existingUser)
      return res.status(400).json({
        message: "User already exists",
      });
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role: parsedData.data.role === "admin" ? "Admin" : "User",
      },
    });
    return res.json({
      userId: user.id,
    });
  } catch (error) {
    return res.status(400).json({
      message: "User already exists",
    });
  }
});

router.post("/signin", async (req: any, res: any) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success)
    return res.status(403).json({
      message: "invalid data",
    });
  try {
    const user = await client.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });
    if (!user)
      return res.status(403).json({
        message: "invalid data",
      });
    const isPasswordCorrect = await bcrypt.compare(
      parsedData.data.password,
      user.password
    );
    if (!isPasswordCorrect)
      return res.status(403).json({
        message: "invalid data",
      });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    return res.json({
      token,
    });
  } catch (error) {
    return res.status(400).json({
      message: "invalid data",
    });
  }
});

router.get("/avatars", userMiddleware, async (req: any, res: any) => {
  const avatars = await client.avatar.findMany();
  return res.json({
    avatars: avatars.map((a) => ({
      id: a.id,
      name: a.name,
      imageUrl: a.imageUrl,
    })),
  });
});

router.get("/elements", userMiddleware, async (req: any, res: any) => {
  const elements = await client.element.findMany();
  return res.json({
    elements: elements.map((e) => ({
      id: e.id,
      width: e.width,
      height: e.height,
      imageUrl: e.imageUrl,
      static: e.static,
    })),
  });
});

router.use("/user", userRouter);
router.use("admin", adminRouter);
router.use("space", spaceRouter);
