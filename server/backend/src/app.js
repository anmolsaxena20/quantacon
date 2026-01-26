import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import socialRoutes from "./routes/social.routes.js";
import { requireAuth } from "./middlewares/auth.middleware.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/payment", /*requireAuth,*/ paymentRoutes);
app.use("/api/social", socialRoutes);

export default app;
