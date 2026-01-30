import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },

    targetModel: {
      type: String,
      required: true,
      enum: ["Post", "Reel"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Comment", commentSchema);
