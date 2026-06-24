"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const mobileNavItems = navItems.filter((item) =>
  ["/dashboard", "/interview", "/coding", "/progress", "/profile"].includes(
    item.href
  )
);

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-deep-border bg-deep-bg/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-intelligence-primary"
                  : "text-text-secondary"
              )}
            >
              <Icon className="size-5" />
              {item.title.split(" ")[0]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
