import {
  BarChart2,
  Code2,
  FileText,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Interview", href: "/interview", icon: MessageSquare },
  { title: "Coding", href: "/coding", icon: Code2 },
  { title: "Resume", href: "/resume", icon: FileText },
  { title: "Progress", href: "/progress", icon: TrendingUp },
  { title: "Reports", href: "/reports", icon: BarChart2 },
  { title: "Profile", href: "/profile", icon: User },
];

export function getPageTitle(pathname: string): string {
  const item = navItems.find(
    (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`)
  );
  return item?.title ?? "Dashboard";
}
