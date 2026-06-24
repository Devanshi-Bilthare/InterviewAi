import { redirect } from "next/navigation";

import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-deep-bg">
      <AdminSidebar user={session.user} />
      <div className="flex min-h-screen flex-col md:pl-60">
        <div className="h-14 md:hidden" aria-hidden />
        <AdminTopbar user={session.user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
