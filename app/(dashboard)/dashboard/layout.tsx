import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your interview practice overview, stats, and quick actions.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
