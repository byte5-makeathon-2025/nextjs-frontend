"use client";

import { ReactNode, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import IconButton from "@/components/ui/IconButton";
import { Parastoo } from "next/font/google";

const parentsLinks = [
  {
    href: "/dashboard/wishes/parents/1",
    label: "Olha Kabatska",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/wishes/parents/2",
    label: "John Doe",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/wishes/parents/3",
    label: "Jane Smith",
    icon: LayoutDashboard,
  },
  // Add more parent links as needed
];
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  console.log("DashboardLayout parent param:", parent, pathname);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 shadow-sm">
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="mb-4">
              <span className="text-xl font-bold text-slate-900">
                Santa Logistics
              </span>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              <p className="text-xs text-slate-600 mb-1">Signed in as</p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.name}
              </p>
            </div>
          </div>

          <nav className="flex flex-col flex-1 px-3 py-4 gap-1">
            <Link
              href="/dashboard/wishes"
              className="flex items-center gap-3 px-3 py-2.5 text-slate-900 bg-slate-100 rounded-lg font-medium"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Wishes</span>
            </Link>
            <h2 className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase">
              Parents
            </h2>
            {parentsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-slate-900  rounded-lg font-medium ${
                  pathname === link.href ? "bg-slate-200" : "bg-slate-100"
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-200">
            <IconButton
              onClick={logout}
              variant="ghost"
              fullWidth
              icon={<LogOut className="w-5 h-5" />}
              className="justify-start px-3"
            >
              Sign Out
            </IconButton>
          </div>
        </div>
      </aside>

      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
