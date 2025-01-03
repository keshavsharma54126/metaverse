import express from "express";
import { router } from "./routes/v1/index";
import cors from "cors";  // Correcting the import for CORS
import dotenv from "dotenv";
dotenv.config();

const app = express();

// CORS options with the correct configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,  // Allows all origins
  methods: 'GET, POST, PUT, DELETE',  // Allowed methods
  allowedHeaders: 'Content-Type, Authorization',  // Allowed headers
};

app.use(cors(corsOptions));  // Apply CORS middleware with the options

app.use(express.json());  // Middleware to parse JSON bodies

// Mount your API routes
app.use("/api/v1", router);

// Start the server
app.listen(3000, () => {
  console.log("Server started at port 3000");
});
