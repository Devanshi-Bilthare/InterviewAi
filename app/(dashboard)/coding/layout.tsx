import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coding Practice",
  description: "Solve coding problems with real-time execution and AI-powered hints.",
};

export default function CodingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
