import mongoose from "mongoose";

const workoutSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },

  energyLevel: { type: String, enum: ["low", "medium", "high"] },

  exercises: [
    {
      exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
        default: null,
      },
      name: { type: String },
      repsDone: { type: Number, default: 0 },
      durationDone: { type: Number, default: 0 },
      xpEarned: { type: Number, default: 50 },
      completed: { type: Boolean, default: true },
    },
  ],

  totalXpEarned: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

export default mongoose.model("WorkoutSessions", workoutSessionSchema);
