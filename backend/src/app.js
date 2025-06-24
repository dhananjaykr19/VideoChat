import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
    cors({
        origin : "http://localhost:5173",
        credentials : true, // allow to frontend to send cookies
    })
);
app.use(express.json({
    limit : "10kb"
}));
app.use(express.urlencoded({
    extended : true,
    limit : "10kb",
}));
app.use(express.static("public"));
app.use(cookieParser());

import authRoutes from "./routes/auth.route.js";
app.use("/api/auth", authRoutes);

import userRouter from "./routes/user.route.js";
app.use("/api/user", userRouter);

import chatRouter from "./routes/chat.route.js";
app.use("/api/chat", chatRouter);
export { app };