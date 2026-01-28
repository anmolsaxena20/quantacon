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
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/djd94qxqr/image/upload/v1767083795/default_yzzskf.png",
    },
    gender: {
      type: String,
      default: "Prefer not to say",
      enum: ["male", "female", "prefer not to say"],
    },

    picturePublicId: {
      type: String,
      default: "default_yzzskf",
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
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isVerifiedUser: { type: Boolean, default: false },
    dob: {
      type: Date,
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

userSchema.pre("validate", function () {
  if (!this.email && !this.phone) {
    throw new Error("Either email or phone number is required");
  }
});

const User = mongoose.model("User", userSchema);

export default User;
