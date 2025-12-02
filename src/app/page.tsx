"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [from, setFrom] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await api.wishes.create({ name, title, description, priority });
			setSubmitted(true);
			setName("");
			setTitle("");
			setDescription("");
			setPriority("medium");
			setTimeout(() => setSubmitted(false), 3000);
		} catch (error) {
			console.error("Failed to submit wish:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#0c1220] flex items-center justify-center p-4 relative overflow-hidden">
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

			<Link
				href="/login"
				className="absolute top-4 right-4 text-xs text-slate-500 hover:text-amber-400 transition-colors z-10"
			>
				staff
			</Link>

			<div className="w-full max-w-5xl relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-2 bg-[#141e30]/80 backdrop-blur-sm border border-slate-700/50 shadow-2xl shadow-black/30 min-h-[600px] rounded-lg overflow-hidden">
					{/* Left side - decorative card cover */}
					<div className="bg-gradient-to-br from-[#1a2744] to-[#0f1724] p-12 flex items-center justify-center border-r border-slate-700/50 relative">
						<div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
						<div className="text-center relative z-10">
							<div className="relative inline-block mb-6">
								<span className="text-7xl">🎄</span>
								<Sparkles className="absolute -top-2 -right-4 w-6 h-6 text-amber-400 animate-pulse" />
							</div>
							<h1 className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 font-serif tracking-wide">
								Christmas Wish
							</h1>
							<p className="text-slate-400 mt-3 text-sm font-light tracking-widest uppercase">
								Make it magical
							</p>
							<div className="flex justify-center gap-2 mt-6">
								<span className="text-red-400">🎁</span>
								<span className="text-emerald-400">❄️</span>
								<span className="text-amber-400">⭐</span>
							</div>
						</div>
					</div>

					{/* Right side - form content */}
					<div className="p-10 md:p-12 flex flex-col justify-center bg-gradient-to-br from-[#141e30] to-[#0f1724]">
						{submitted ? (
							<div className="text-center">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-900/30 border border-emerald-500/30 rounded-full mb-4">
									<CheckCircle className="w-8 h-8 text-emerald-400" />
								</div>
								<h2 className="text-2xl text-amber-100 mb-2 font-serif">
									Thank you!
								</h2>
								<p className="text-slate-400">
									Your wish has been sent to Santa 🎅
								</p>
							</div>
						) : (
							<form
								onSubmit={handleSubmit}
								className="space-y-5"
							>
								<div>
									<label
										htmlFor="name"
										className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide"
									>
										Your name
									</label>
									<input
										type="text"
										id="name"
										required
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="w-full px-3 py-2 border border-slate-600/50 bg-slate-800/50 rounded focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition text-slate-100 placeholder:text-slate-500"
									/>
								</div>

								<div>
									<label
										htmlFor="from"
										className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide"
									>
										Where are you from?
									</label>
									<input
										type="text"
										id="from"
										required
										value={from}
										onChange={(e) => setFrom(e.target.value)}
										className="w-full px-3 py-2 border border-slate-600/50 bg-slate-800/50 rounded focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition text-slate-100 placeholder:text-slate-500"
									/>
								</div>

								<div>
									<label
										htmlFor="title"
										className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide"
									>
										I wish for...
									</label>
									<input
										type="text"
										id="title"
										required
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										className="w-full px-3 py-2 border border-slate-600/50 bg-slate-800/50 rounded focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none transition text-slate-100 placeholder:text-slate-500"
									/>
								</div>

								<div>
									<label
										htmlFor="description"
										className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide"
									>
										Tell us more about your wish
									</label>
									<textarea
										id="description"
										required
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										rows={5}
										className="w-full px-3 py-2 border border-slate-600/50 bg-slate-800/50 rounded focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none resize-none text-slate-100 placeholder:text-slate-500"
										placeholder="Describe your Christmas wish..."
									/>
								</div>

								<div>
									<label className="block text-sm text-amber-200/70 mb-3 font-light tracking-wide">
										How important is this wish?
									</label>
									<div className="flex gap-4">
										{(["low", "medium", "high"] as const).map((p) => (
											<label
												key={p}
												className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border transition-all ${
													priority === p
														? "bg-red-900/40 border-red-500/50 text-red-200"
														: "bg-slate-800/30 border-slate-600/30 text-slate-400 hover:border-slate-500/50"
												}`}
											>
												<input
													type="radio"
													name="priority"
													value={p}
													checked={priority === p}
													onChange={() => setPriority(p)}
													className="sr-only"
												/>
												<span className="capitalize text-sm">
													{p === "low" && "🌟"}
													{p === "medium" && "⭐"}
													{p === "high" && "🌟⭐🌟"} {p}
												</span>
											</label>
										))}
									</div>
								</div>

								<div className="pt-4">
									<button
										type="submit"
										disabled={loading}
										className="w-full py-3 px-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-red-900/30 hover:shadow-red-900/50 disabled:shadow-none border border-red-600/30 hover:border-red-500/50 disabled:border-slate-600"
									>
										{loading ? (
											<span className="flex items-center justify-center gap-2">
												<span className="animate-spin">❄️</span>
												Sending to the North Pole...
											</span>
										) : (
											<span className="flex items-center justify-center gap-2">
												<span>🎁</span>
												Send My Wish
											</span>
										)}
									</button>
								</div>
							</form>
						)}
					</div>
				</div>

				{/* Footer decoration */}
				<p className="text-center text-slate-600 text-xs mt-6 tracking-widest">
					✦ May all your wishes come true ✦
				</p>
			</div>
		</div>
	);
}
