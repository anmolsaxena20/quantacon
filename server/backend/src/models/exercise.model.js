import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },

  muscleGroups: [{ type: String }],
  type: { type: String, enum: ["strength", "cardio", "mobility"] },
  equipment: { type: String, default: "bodyweight" },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"] },

  baseReps: {
    low: Number,
    medium: Number,
    high: Number,
  },

  baseDuration: {
    low: Number,
    medium: Number,
    high: Number,
  },

  xpReward: {
    low: Number,
    medium: Number,
    high: Number,
  },

  demoVideoUrl: String,
  instructions: String,
});

export default mongoose.model("Exercise", exerciseSchema);
