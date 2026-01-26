import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { requireAuth } from "./middlewares/auth.middleware.js";
const app = express();

/* -------- Middlewares -------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
/* -------- Routes -------- */
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

/* -------- Health Check -------- */
app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;
