import type { Wish, Status } from "@/types";
import { ChevronDown } from "lucide-react";
import { useState, MouseEvent } from "react";

interface WishCardProps {
	wish: Wish;
	onStatusChange: (wishId: number, status: Status) => void;
	onClick: () => void;
	onDragStart: (wish: Wish) => void;
	onDragEnd: () => void;
}

const priorityColors = {
	high: "bg-red-900/40 text-red-200 border-red-500/30",
	medium: "bg-amber-900/40 text-amber-200 border-amber-500/30",
	low: "bg-slate-700/40 text-slate-300 border-slate-500/30",
};

const priorityEmoji = {
	high: "🔥",
	medium: "⭐",
	low: "❄️",
};

const statusOptions: { value: Status; label: string; emoji: string }[] = [
	{ value: "pending", label: "Pending", emoji: "📬" },
	{ value: "in_progress", label: "In Progress", emoji: "🔨" },
	{ value: "granted", label: "Granted", emoji: "✨" },
	{ value: "denied", label: "Denied", emoji: "❄️" },
];

export default function WishCard({
	wish,
	onStatusChange,
	onClick,
	onDragStart,
	onDragEnd,
}: WishCardProps) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);

	const handleStatusClick = (e: MouseEvent, newStatus: Status) => {
		e.stopPropagation();
		onStatusChange(wish.id, newStatus);
		setShowStatusMenu(false);
	};

	return (
		<div
			className="bg-[#1a2744]/80 backdrop-blur-sm rounded-lg border border-slate-600/30 p-4 hover:shadow-lg hover:shadow-black/20 hover:border-amber-500/30 transition cursor-move relative group"
			onClick={onClick}
			draggable
			onDragStart={(e) => {
				onDragStart(wish);
				e.currentTarget.style.opacity = "0.5";
			}}
			onDragEnd={(e) => {
				e.currentTarget.style.opacity = "1";
				onDragEnd();
			}}
		>
			<div className="flex items-start justify-between mb-2">
				<h3 className="font-medium text-amber-100 line-clamp-2 flex-1 text-sm">
					{wish.title}
				</h3>
				<span
					className={`text-xs px-2 py-0.5 rounded border ml-2 font-medium flex items-center gap-1 ${
						priorityColors[wish.priority]
					}`}
				>
					<span>{priorityEmoji[wish.priority]}</span>
					{wish.priority}
				</span>
			</div>

			<p className="text-sm text-slate-400 line-clamp-3 mb-3">
				{wish.description}
			</p>

			{(wish.user || wish.name) && (
				<div className="text-xs text-slate-500 mb-3 flex items-center gap-2">
					<div className="w-5 h-5 bg-gradient-to-br from-red-700 to-red-900 rounded-full flex items-center justify-center border border-red-500/30">
						<span className="text-[10px] font-semibold text-red-100">
							{(wish.user?.name || wish.name || "").charAt(0).toUpperCase()}
						</span>
					</div>
					<span className="text-slate-400">{wish.user?.name || wish.name}</span>
				</div>
			)}

			<div
				className="relative"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={() => setShowStatusMenu(!showStatusMenu)}
					className="text-xs text-slate-500 hover:text-amber-400 flex items-center gap-1 font-medium cursor-pointer transition"
				>
					Change status
					<ChevronDown className="w-3 h-3" />
				</button>

				{showStatusMenu && (
					<div className="absolute bottom-full left-0 mb-1 bg-[#1a2744] border border-slate-600/50 rounded-lg shadow-xl shadow-black/30 z-10 min-w-[150px] overflow-hidden">
						{statusOptions.map((option) => (
							<button
								key={option.value}
								onClick={(e) => handleStatusClick(e, option.value)}
								className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-slate-700/50 font-medium text-slate-300 hover:text-amber-200 cursor-pointer transition"
							>
								<span>{option.emoji}</span>
								{option.label}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
