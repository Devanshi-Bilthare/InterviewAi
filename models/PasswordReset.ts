import mongoose, { Schema, models } from "mongoose";

export interface IPasswordReset {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset =
  models.PasswordReset ||
  mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);

export default PasswordReset;
