"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { login } = useAuth();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await login({ email, password });
		} catch {
			setError("Invalid credentials. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#0c1220] flex items-center justify-center px-4 relative overflow-hidden">
			{/* Background decorations */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a2744_0%,_#0c1220_70%)]" />
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
			<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl" />

			{/* Decorative stars */}
			<div className="absolute top-20 left-20 text-amber-400/30 text-2xl animate-pulse">
				✦
			</div>
			<div
				className="absolute top-40 right-32 text-amber-400/20 text-lg animate-pulse"
				style={{ animationDelay: "0.5s" }}
			>
				✦
			</div>
			<div
				className="absolute bottom-32 left-40 text-amber-400/25 text-xl animate-pulse"
				style={{ animationDelay: "1s" }}
			>
				✦
			</div>
			<div
				className="absolute top-1/3 right-20 text-amber-400/15 text-sm animate-pulse"
				style={{ animationDelay: "1.5s" }}
			>
				✦
			</div>

			<div className="w-full max-w-md relative z-10">
				<div className="text-center mb-8">
					<div className="relative inline-block mb-4">
						<span className="text-5xl">🎅</span>
						<Sparkles className="absolute -top-1 -right-3 w-5 h-5 text-amber-400 animate-pulse" />
					</div>
					<h1 className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 font-serif mb-2">
						Welcome Back
					</h1>
					<p className="text-slate-400 font-light">
						Sign in to Santa&apos;s workshop
					</p>
				</div>

				<div className="bg-[#141e30]/80 backdrop-blur-sm rounded-xl shadow-2xl shadow-black/30 border border-slate-700/50 p-8">
					<form
						onSubmit={handleSubmit}
						className="space-y-5"
					>
						{error && (
							<div className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
								{error}
							</div>
						)}

						<div>
							<label
								htmlFor="email"
								className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide"
							>
								Email Address
							</label>
							<input
								type="email"
								id="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-2.5 border border-slate-600/50 bg-slate-800/50 rounded-lg focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition text-slate-100 placeholder:text-slate-500"
								placeholder="you@northpole.com"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-2.5 border border-slate-600/50 bg-slate-800/50 rounded-lg focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition text-slate-100 placeholder:text-slate-500"
								placeholder="••••••••"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 px-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-red-900/30 hover:shadow-red-900/50 disabled:shadow-none border border-red-600/30 hover:border-red-500/50 disabled:border-slate-600 flex items-center justify-center gap-2"
						>
							{loading ? (
								<>
									<span className="animate-spin">❄️</span>
									Checking the list...
								</>
							) : (
								<>
									<LogIn className="w-4 h-4" />
									Sign In
								</>
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<Link
							href="/"
							className="text-sm text-slate-400 hover:text-amber-400 transition"
						>
							← Back to Wish Form
						</Link>
					</div>
				</div>

				{/* Footer decoration */}
				<p className="text-center text-slate-600 text-xs mt-6 tracking-widest">
					✦ Staff Portal ✦
				</p>
			</div>
		</div>
	);
}
