import { ReactNode } from "react";

import { GradientOrbs } from "@/components/auth/GradientOrbs";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-deep-bg px-4 py-12">
      <GradientOrbs />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
