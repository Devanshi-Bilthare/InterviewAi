import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("Resend not configured, skipping email:", subject);
    return;
  }

  try {
    await resend.emails.send({ from: fromEmail, to, subject, html });
  } catch (error) {
    console.error("Email send error:", error);
  }
}

export function interviewCompleteEmail(name: string, score: number, category: string) {
  return {
    subject: "Your mock interview results are ready",
    html: `<p>Hi ${name},</p><p>Your <strong>${category}</strong> mock interview is complete. You scored <strong>${score}/100</strong>.</p><p>Log in to InterviewAI to view detailed feedback and improve your skills.</p>`,
  };
}

export function reportReadyEmail(name: string) {
  return {
    subject: "Your AI career report is ready",
    html: `<p>Hi ${name},</p><p>Your personalized career development report has been generated. Review your strengths, growth areas, and 30-day roadmap on InterviewAI.</p>`,
  };
}

export function milestoneEmail(name: string, milestone: string) {
  return {
    subject: `Milestone achieved: ${milestone}`,
    html: `<p>Hi ${name},</p><p>Congratulations! You've unlocked the <strong>${milestone}</strong> achievement on InterviewAI. Keep up the great work!</p>`,
  };
}
