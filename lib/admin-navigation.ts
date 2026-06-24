import {
  HelpCircle,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Questions", href: "/admin/questions", icon: HelpCircle },
];

export function getAdminPageTitle(pathname: string): string {
  const item = adminNavItems.find(
    (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`)
  );
  return item?.title ?? "Admin";
}
