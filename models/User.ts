import mongoose, { Schema, models } from "mongoose";
import type { IUser } from "@/types";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    profilePicture: { type: String },
    role: {
      type: String,
      enum: ["candidate", "admin"],
      default: "candidate",
    },
    skills: { type: [String], default: [] },
    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior"],
    },
    targetRole: { type: String },
    linkedIn: { type: String },
    github: { type: String },
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    isSuspended: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
