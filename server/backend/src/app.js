import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import socialRoutes from "./routes/social.routes.js";
import userRoutes from "./routes/user.routes.js";
import { requireAuth } from "./middlewares/auth.middleware.js";
import passport from "./config/passport.config.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/payment", requireAuth, paymentRoutes);
app.use("/api/social", requireAuth, socialRoutes);
app.use("/api/users", requireAuth, userRoutes);

export default app;
