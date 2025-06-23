import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

import authRoutes from "./routes/auth.route.js";
app.use("/api/auth", authRoutes);

export { app };