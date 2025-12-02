"use client";

import { useEffect, useState, DragEvent } from "react";
import { api } from "@/lib/api";
import type { Wish, Status } from "@/types";
import { Clock, CheckCircle, XCircle, Loader } from "lucide-react";
import WishCard from "@/components/WishCard";
import WishDetailsModal from "@/components/WishDetailsModal";

const statusConfig = {
	pending: {
		title: "Pending",
		icon: Clock,
		emoji: "📬",
		color: "bg-amber-900/30 text-amber-200 border-amber-500/30",
		dropColor: "bg-amber-900/20 border-amber-500/40",
	},
	in_progress: {
		title: "In Progress",
		icon: Loader,
		emoji: "🔨",
		color: "bg-blue-900/30 text-blue-200 border-blue-500/30",
		dropColor: "bg-blue-900/20 border-blue-500/40",
	},
	granted: {
		title: "Granted",
		icon: CheckCircle,
		emoji: "✨",
		color: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30",
		dropColor: "bg-emerald-900/20 border-emerald-500/40",
	},
	denied: {
		title: "Denied",
		icon: XCircle,
		emoji: "❄️",
		color: "bg-slate-700/30 text-slate-300 border-slate-500/30",
		dropColor: "bg-slate-700/20 border-slate-500/40",
	},
};

export default function WishesPage() {
	const [wishes, setWishes] = useState<Wish[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
	const [draggedWish, setDraggedWish] = useState<Wish | null>(null);
	const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

	useEffect(() => {
		loadWishes();
	}, []);

	const loadWishes = async () => {
		try {
			console.log("Fetching wishes...");
			const data = await api.wishes.getAll();
			console.log("Loaded wishes:", data);
			console.log("Is array?", Array.isArray(data));
			console.log("Type:", typeof data);
			setWishes(Array.isArray(data) ? data : []);
		} catch (error: unknown) {
			console.error("Failed to load wishes:", error);
			if (error instanceof Error) {
				console.error("Error details:", error.message);
			}
			setWishes([]);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = async (wishId: number, newStatus: Status) => {
		try {
			await api.wishes.update(wishId, { status: newStatus });
			setWishes((prev) =>
				prev.map((wish) =>
					wish.id === wishId ? { ...wish, status: newStatus } : wish
				)
			);
		} catch (error) {
			console.error("Failed to update wish status:", error);
		}
	};

	const handleWishUpdate = (updatedWish: Wish) => {
		setWishes((prev) =>
			prev.map((wish) => (wish.id === updatedWish.id ? updatedWish : wish))
		);
	};

	const handleWishDelete = (wishId: number) => {
		setWishes((prev) => prev.filter((wish) => wish.id !== wishId));
	};

	const getWishesByStatus = (status: Status) =>
		wishes.filter((wish) => wish.status === status);

	const handleDragStart = (wish: Wish) => {
		setDraggedWish(wish);
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	const handleDragEnter = (status: Status) => {
		if (draggedWish) {
			setDragOverColumn(status);
		}
	};

	const handleDrop = async (e: DragEvent, newStatus: Status) => {
		e.preventDefault();
		setDragOverColumn(null);

		if (!draggedWish || draggedWish.status === newStatus) {
			setDraggedWish(null);
			return;
		}

		const updatedWish = { ...draggedWish, status: newStatus };
		setWishes((prev) =>
			prev.map((wish) => (wish.id === draggedWish.id ? updatedWish : wish))
		);
		setDraggedWish(null);

		try {
			await api.wishes.update(draggedWish.id, { status: newStatus });
		} catch (error) {
			console.error("Failed to update wish status:", error);
			setWishes((prev) =>
				prev.map((wish) => (wish.id === draggedWish.id ? draggedWish : wish))
			);
		}
	};

	const handleDragEnd = () => {
		setDragOverColumn(null);
		setDraggedWish(null);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<div className="text-4xl mb-4 animate-bounce">🎁</div>
					<p className="text-amber-200/70">
						Loading wishes from the mailbag...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<h1 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
						Christmas Wishes
					</h1>
					<span className="text-2xl">🎄</span>
				</div>
				<p className="text-slate-400 font-light">
					Manage and track all wishes from around the world
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
				{(Object.keys(statusConfig) as Status[]).map((status) => {
					const config = statusConfig[status];
					const statusWishes = getWishesByStatus(status);
					const Icon = config.icon;

					return (
						<div
							key={status}
							className="flex flex-col"
						>
							<div
								className={`rounded-lg border p-4 mb-4 backdrop-blur-sm ${config.color}`}
							>
								<div className="flex items-center gap-3">
									<span className="text-lg">{config.emoji}</span>
									<Icon className="w-4 h-4 opacity-70" />
									<h2 className="font-medium text-sm uppercase tracking-wide">
										{config.title}
									</h2>
									<span className="ml-auto text-sm font-bold bg-black/20 px-2 py-0.5 rounded">
										{statusWishes.length}
									</span>
								</div>
							</div>

							<div
								className={`space-y-3 flex-1 min-h-[200px] rounded-lg transition-all ${
									dragOverColumn === status
										? `${config.dropColor} border-2 border-dashed p-2`
										: "border-2 border-transparent"
								}`}
								onDragOver={handleDragOver}
								onDragEnter={() => handleDragEnter(status)}
								onDrop={(e) => handleDrop(e, status)}
							>
								{statusWishes.map((wish) => (
									<WishCard
										key={wish.id}
										wish={wish}
										onStatusChange={handleStatusChange}
										onClick={() => setSelectedWish(wish)}
										onDragStart={handleDragStart}
										onDragEnd={handleDragEnd}
									/>
								))}
								{statusWishes.length === 0 && (
									<div className="text-center py-8 text-slate-500 text-sm">
										<span className="text-2xl block mb-2">❄️</span>
										Drop wishes here
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{selectedWish && (
				<WishDetailsModal
					wish={selectedWish}
					onClose={() => setSelectedWish(null)}
					onUpdate={handleWishUpdate}
					onDelete={handleWishDelete}
				/>
			)}
		</div>
	);
}
