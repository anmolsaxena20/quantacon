import mongoose from "mongoose";
const workoutSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },

  energyLevel: { type: String, enum: ["low", "medium", "high"] },

  exercises: [
    {
      exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise" },
      repsDone: Number,
      durationDone: Number,
      xpEarned: Number,
      completed: Boolean,
    },
  ],

  totalXpEarned: Number,
  completed: { type: Boolean, default: false },
});
export default mongoose.model("WorkoutSessions", workoutSessionSchema);
