import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export const adminMiddleware = (req: any, res: any, next: any) => {
  const header = req.headers.authorization;
 
  const token = header.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      message: "unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      role: string;
      userId: string;
      iat:number
    };
  
   
    if (decoded.role !== "Admin") {
      return res.status(400).json({
        message: "unauthorized",
      });
    }
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(400).json({
      message: "unauthorized",
    });
  }
};
