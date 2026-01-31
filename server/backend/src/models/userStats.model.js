import mongoose from "mongoose";

const userStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },

  level: { type: Number, default: 1 },
  currentXp: { type: Number, default: 0 },
  totalXp: { type: Number, default: 0 },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastWorkoutDate: Date,
  },

  workoutsCompleted: { type: Number, default: 0 },
  minutesTrained: { type: Number, default: 0 },
});

export default mongoose.model("UserStats", userStatsSchema);
