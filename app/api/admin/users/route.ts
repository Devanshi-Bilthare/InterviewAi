import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import connectDB from "@/lib/mongodb";
import { updateUserSchema } from "@/lib/validations/admin";
import User from "@/models/User";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10))
    );
    const search = searchParams.get("search")?.trim();
    const role = searchParams.get("role");
    const skip = (page - 1) * limit;

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "name email role totalInterviews averageScore isSuspended createdAt profilePicture"
        )
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        totalInterviews: u.totalInterviews,
        averageScore: u.averageScore,
        isSuspended: u.isSuspended ?? false,
        joinedAt: u.createdAt,
        profilePicture: u.profilePicture,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin users fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { userId, role, isSuspended } = parsed.data;

    await connectDB();

    const update: Record<string, unknown> = {};
    if (role !== undefined) update.role = role;
    if (isSuspended !== undefined) update.isSuspended = isSuspended;

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select(
      "name email role isSuspended"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isSuspended: user.isSuspended ?? false,
      },
    });
  } catch (err) {
    console.error("Admin user update error:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
