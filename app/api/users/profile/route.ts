import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import { auth } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const revalidate = 60;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  await connectDB();
  const user = await User.findById(session.user.id).select(
    "-password"
  );

  if (!user) return apiError("User not found", 404);

  return apiSuccess({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      experienceLevel: user.experienceLevel,
      targetRole: user.targetRole,
      skills: user.skills,
      linkedIn: user.linkedIn,
      github: user.github,
      totalInterviews: user.totalInterviews,
      averageScore: user.averageScore,
      onboardingCompleted: user.onboardingCompleted ?? false,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const body = await request.json();
  await connectDB();

  const allowed = [
    "name",
    "experienceLevel",
    "targetRole",
    "skills",
    "linkedIn",
    "github",
    "onboardingCompleted",
  ] as const;

  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }

  const user = await User.findByIdAndUpdate(session.user.id, update, {
    new: true,
  }).select("-password");

  if (!user) return apiError("User not found", 404);

  return apiSuccess({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      experienceLevel: user.experienceLevel,
      targetRole: user.targetRole,
      skills: user.skills,
      linkedIn: user.linkedIn,
      github: user.github,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  const body = await request.json();

  if (body.action === "changePassword") {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return apiError("Invalid password data", 400);
    }

    await connectDB();
    const user = await User.findById(session.user.id).select("+password");
    if (!user) return apiError("User not found", 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return apiError("Current password is incorrect", 400);

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return apiSuccess({ message: "Password updated" });
  }

  if (body.action === "uploadAvatar" && body.image) {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return apiError("Avatar upload not configured", 503);
    }

    const result = await cloudinary.uploader.upload(body.image, {
      folder: "interview-ai/avatars",
      transformation: [{ width: 256, height: 256, crop: "fill" }],
    });

    await connectDB();
    await User.findByIdAndUpdate(session.user.id, {
      profilePicture: result.secure_url,
    });

    return apiSuccess({ profilePicture: result.secure_url });
  }

  if (body.action === "deleteAccount") {
    if (!body.confirmEmail || body.confirmEmail !== session.user.email) {
      return apiError("Email confirmation required", 400);
    }

    await connectDB();
    await User.findByIdAndDelete(session.user.id);
    return apiSuccess({ deleted: true });
  }

  return apiError("Invalid action", 400);
}
