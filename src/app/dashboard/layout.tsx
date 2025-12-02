"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, LogOut, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	const { user, loading, logout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#0c1220]">
				<div className="text-center">
					<div className="text-4xl mb-4 animate-bounce">🎅</div>
					<p className="text-amber-200/70">Loading workshop...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-[#0c1220]">
			{/* Background decorations */}
			<div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_#1a2744_0%,_#0c1220_70%)] pointer-events-none" />
			<div className="fixed top-0 left-1/4 w-96 h-96 bg-red-900/5 rounded-full blur-3xl pointer-events-none" />
			<div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-900/5 rounded-full blur-3xl pointer-events-none" />

			<aside className="fixed inset-y-0 left-0 w-64 bg-[#141e30]/90 backdrop-blur-sm border-r border-slate-700/50 shadow-xl z-20">
				<div className="flex flex-col h-full">
					<div className="px-6 py-5 border-b border-slate-700/50">
						<div className="mb-4 flex items-center gap-2">
							<span className="text-2xl">🎄</span>
							<div className="relative">
								<span className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
									Santa&apos;s Workshop
								</span>
								<Sparkles className="absolute -top-1 -right-4 w-3 h-3 text-amber-400 animate-pulse" />
							</div>
						</div>
						<div className="bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-600/30">
							<p className="text-xs text-slate-400 mb-1">Logged in as</p>
							<p className="text-sm font-medium text-amber-100 truncate">
								{user.name}
							</p>
						</div>
					</div>

					<nav className="flex-1 px-3 py-4 space-y-2">
						<Link
							href="/dashboard/wishes"
							className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
								pathname === "/dashboard/wishes"
									? "text-amber-100 bg-red-900/30 border border-red-500/20"
									: "text-slate-300 hover:text-amber-100 hover:bg-slate-800/50 border border-transparent hover:border-slate-600/30"
							}`}
						>
							<LayoutDashboard
								className={`w-5 h-5 ${
									pathname === "/dashboard/wishes"
										? "text-red-400"
										: "text-slate-500"
								}`}
							/>
							<span>Wishes</span>
							<span className="ml-auto text-lg">🎁</span>
						</Link>
						<Link
							href="/dashboard/map"
							className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
								pathname === "/dashboard/map"
									? "text-amber-100 bg-emerald-900/30 border border-emerald-500/20"
									: "text-slate-300 hover:text-amber-100 hover:bg-slate-800/50 border border-transparent hover:border-slate-600/30"
							}`}
						>
							<MapPin
								className={`w-5 h-5 ${
									pathname === "/dashboard/map"
										? "text-emerald-400"
										: "text-slate-500"
								}`}
							/>
							<span>Map</span>
							<span className="ml-auto text-lg">🗺️</span>
						</Link>
					</nav>

					<div className="p-3 border-t border-slate-700/50">
						<button
							onClick={logout}
							className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:text-red-300 hover:bg-slate-800/50 rounded-lg transition"
						>
							<LogOut className="w-5 h-5" />
							<span>Sign Out</span>
						</button>
					</div>

					{/* Decorative footer */}
					<div className="px-6 py-4 text-center">
						<p className="text-slate-600 text-xs tracking-widest">
							✦ North Pole HQ ✦
						</p>
					</div>
				</div>
			</aside>

			<main className="ml-64 h-screen p-8 relative z-10">{children}</main>
		</div>
	);
}
