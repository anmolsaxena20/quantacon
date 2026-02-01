import cron from "node-cron";
import UserStats from "../models/userStats.model.js";
import WorkoutSessions from "../models/workoutSession.model.js";

cron.schedule("0 0 * * *", async () => {
  console.log("cron working");
  const users = await UserStats.find();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  for (const stats of users) {
    const workout = await WorkoutSessions.findOne({
      user: stats.user,
      completed: true,
      date: { $gte: yesterday },
    });

    if (!workout) {
      stats.streak.current = 0;
      await stats.save();
    }
  }
});