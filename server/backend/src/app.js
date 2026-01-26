import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

/* -------- Middlewares -------- */
app.use(cors());
app.use(express.json());
app.use(cookieParser());
/* -------- Routes -------- */
app.use("/api/auth", authRoutes);

/* -------- Health Check -------- */
app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;
