import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import app from "./src/app.js";
import "./src/cron/progress.cron.js";
import { initSocket } from "./src/socket/socket.js";
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected");

  const server = http.createServer(app);

  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
