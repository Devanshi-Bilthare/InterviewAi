import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Analyzer",
  description:
    "Upload your resume for AI scoring, skill extraction, and interview preparation tips.",
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
