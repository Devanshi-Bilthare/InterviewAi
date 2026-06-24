import mongoose, { Schema, models } from "mongoose";

export interface INotification {
  userId: mongoose.Types.ObjectId;
  type: "interview" | "report" | "milestone" | "system";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["interview", "report", "milestone", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Notification =
  models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
