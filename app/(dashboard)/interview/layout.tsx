import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Interviews",
  description: "Practice mock interviews with AI feedback across multiple categories.",
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
