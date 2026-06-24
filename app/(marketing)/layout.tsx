import { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";
import { GradientOrbs } from "@/components/auth/GradientOrbs";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-deep-bg">
      <GradientOrbs />
      <Navbar />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
