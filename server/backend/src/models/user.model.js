import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    // Either email or phone is required
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    refreshToken: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^\+\d{10,15}$/, "Invalid phone number"],
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: 8,
    },
    tier: {
      type: String,
      default: "free",
      enum: ["free", "gold", "pro"],
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },

    // For Google OAuth users
    googleId: {
      type: String,
      sparse: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure at least one of email or phone exists
userSchema.pre("validate", function () {
  if (!this.email && !this.phone) {
    throw new Error("Either email or phone number is required");
  }
});

const User = mongoose.model("User", userSchema);

export default User;
