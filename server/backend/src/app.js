import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import socialRoutes from "./routes/social.routes.js";
import userRoutes from "./routes/user.routes.js";
import workoutRoutes from "./routes/workout.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import aiChatBotRoutes from "./routes/aiChatBot.routes.js";
import genAiWorkoutRoutes from "./routes/ai.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { requireAuth } from "./middlewares/auth.middleware.js";
import { allowTiers } from "./middlewares/tier.middleware.js";
import passport from "./config/passport.config.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/payment", requireAuth, paymentRoutes);
app.use("/api/social", requireAuth, socialRoutes);
app.use("/api/social/chat", requireAuth, chatRoutes);
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/workout", requireAuth, workoutRoutes);
app.use("/api/progress", requireAuth, progressRoutes);
app.use("/api/notification", requireAuth, notificationRoutes);
app.use(
  "/api/ai/chat",
  requireAuth,
  allowTiers("silver", "gold"),
  aiChatBotRoutes,
);
app.use(
  "/api/ai",
  requireAuth,
  /*
  allowTiers("silver", "gold"),
  */ genAiWorkoutRoutes,
);
export default app;
