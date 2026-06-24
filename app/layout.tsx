import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers/providers";

export const metadata: Metadata = {
  title: {
    default: "InterviewAI — AI Interview Platform",
    template: "%s | InterviewAI",
  },
  description:
    "Practice interviews, coding challenges, and track your progress with AI-powered feedback. Mock interviews, real-time AI interviewer, and career reports.",
  keywords: [
    "mock interview",
    "AI interview",
    "coding practice",
    "interview preparation",
  ],
  authors: [{ name: "InterviewAI" }],
  openGraph: {
    title: "InterviewAI — AI Interview Platform",
    description:
      "Practice interviews, coding challenges, and track your progress with AI-powered feedback.",
    type: "website",
    locale: "en_US",
    siteName: "InterviewAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewAI",
    description: "AI-powered mock interviews and coding practice",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark font-sans")} suppressHydrationWarning>
      <body
        className="min-h-screen bg-deep-bg text-text-primary antialiased"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
