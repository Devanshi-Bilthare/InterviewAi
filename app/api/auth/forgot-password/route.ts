import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { z } from "zod";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    await connectDB();

    const user = await User.findOne({ email: normalizedEmail });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordReset.deleteMany({ email: normalizedEmail });
    await PasswordReset.create({
      email: normalizedEmail,
      token,
      expiresAt,
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "InterviewAI <onboarding@resend.dev>",
        to: normalizedEmail,
        subject: "Reset your InterviewAI password",
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #6366F1; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #374151; line-height: 1.6;">
              Hi ${user.name}, click the button below to reset your password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Reset Password
            </a>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 32px;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } else {
      console.log(`[dev] Password reset link for ${normalizedEmail}: ${resetUrl}`);
    }

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
