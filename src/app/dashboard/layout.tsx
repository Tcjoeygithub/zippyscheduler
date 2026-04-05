import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-xl text-brand-dark">
                Zippy Scheduler
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="text-brand-gray hover:text-brand-dark"
              >
                Accounts
              </Link>
              <Link
                href="/dashboard/boards"
                className="text-brand-gray hover:text-brand-dark"
              >
                Boards
              </Link>
              <Link
                href="/dashboard/pins"
                className="text-brand-gray hover:text-brand-dark"
              >
                Pins
              </Link>
              <Link
                href="/dashboard/pins/new"
                className="text-brand-gray hover:text-brand-dark"
              >
                New Pin
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-brand-gray hidden sm:inline">
              {user.email}
            </span>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="text-sm font-medium text-brand-gray hover:text-brand-dark"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
