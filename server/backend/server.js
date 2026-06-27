import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import app from "./src/app.js";
import "./src/cron/progress.cron.js";
import { initSocket } from "./src/socket/socket.js";
import mailTransporter from "./src/config/nodemailer.config.js";

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("MongoDB connected");
  try {
    await mailTransporter.verify();
    console.log("SMTP connected successfully");
  } catch (err) {
    console.error("SMTP verification failed");
    console.error(err);
  }
  const server = http.createServer(app);

  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
