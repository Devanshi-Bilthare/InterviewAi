import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  await connectDB();
  const dbUser = await User.findById(session.user.id)
    .select("onboardingCompleted")
    .lean();

  const pathname = headers().get("x-pathname") ?? "";
  const onboardingExempt =
    pathname === "/resume" || pathname.startsWith("/resume/");

  if (!dbUser?.onboardingCompleted && !onboardingExempt) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-deep-bg">
      <Sidebar user={session.user} />
      <div className="flex min-h-screen flex-col md:pl-60">
        <div className="h-14 md:hidden" aria-hidden />
        <Topbar user={session.user} />
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
