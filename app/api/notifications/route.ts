import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export const revalidate = 30;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  await connectDB();
  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return apiSuccess({
    notifications: notifications.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      link: n.link,
      createdAt: n.createdAt,
    })),
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const body = await request.json();
  await connectDB();

  if (body.markAll) {
    await Notification.updateMany(
      { userId: session.user.id, read: false },
      { read: true }
    );
  } else if (body.id) {
    await Notification.findOneAndUpdate(
      { _id: body.id, userId: session.user.id },
      { read: true }
    );
  }

  return apiSuccess({ updated: true });
}
