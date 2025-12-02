'use client';

import {ReactNode, useEffect} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, LogOut, MapPin } from 'lucide-react';
import Link from 'next/link';
import IconButton from '@/components/ui/IconButton';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard/wishes', label: 'Wishes', icon: LayoutDashboard },
    { href: '/dashboard/locations', label: 'Locations', icon: MapPin },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
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
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              );
            })}
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
