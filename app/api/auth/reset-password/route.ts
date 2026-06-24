import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import { resetPasswordSchema } from "@/lib/validations/auth";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, error: "Missing reset token" }, { status: 400 });
    }

    await connectDB();

    const resetRecord = await PasswordReset.findOne({ token });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json(
      { valid: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    await connectDB();

    const resetRecord = await PasswordReset.findOne({ token });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: resetRecord.email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "Account not found. Please sign up again." },
        { status: 404 }
      );
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();
    await PasswordReset.deleteMany({ email: resetRecord.email });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
