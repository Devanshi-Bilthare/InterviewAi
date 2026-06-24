import connectDB from "./mongodb";
import Notification from "@/models/Notification";

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: "interview" | "report" | "milestone" | "system";
  title: string;
  message: string;
  link?: string;
}) {
  await connectDB();
  return Notification.create({ userId, type, title, message, link });
}
