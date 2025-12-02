import { useState } from 'react';
import { X, Trash2, Save, User, Calendar } from 'lucide-react';
import type { Wish, Status, Priority } from '@/types';
import { api } from '@/lib/api';

interface WishDetailsModalProps {
	wish: Wish;
	onClose: () => void;
	onUpdate: (wish: Wish) => void;
	onDelete: (wishId: number) => void;
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

const statusColors = {
	pending: "bg-amber-900/30 text-amber-200 border-amber-500/30",
	in_progress: "bg-blue-900/30 text-blue-200 border-blue-500/30",
	granted: "bg-emerald-900/30 text-emerald-200 border-emerald-500/30",
	denied: "bg-slate-700/30 text-slate-300 border-slate-500/30",
};

const statusEmoji = {
	pending: "📬",
	in_progress: "🔨",
	granted: "✨",
	denied: "❄️",
};

export default function WishDetailsModal({
	wish,
	onClose,
	onUpdate,
	onDelete,
}: WishDetailsModalProps) {
	const [editing, setEditing] = useState(false);
	const [title, setTitle] = useState(wish.title);
	const [description, setDescription] = useState(wish.description);
	const [priority, setPriority] = useState<Priority>(wish.priority);
	const [status, setStatus] = useState<Status>(wish.status);
	const [loading, setLoading] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState(false);

	const handleSave = async () => {
		setLoading(true);
		try {
			const updated = await api.wishes.update(wish.id, {
				title,
				description,
				priority,
				status,
			});
			onUpdate(updated);
			setEditing(false);
		} catch (error) {
			console.error("Failed to update wish:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteConfirm) {
			setDeleteConfirm(true);
			return;
		}

		setLoading(true);
		try {
			await api.wishes.delete(wish.id);
			onDelete(wish.id);
			onClose();
		} catch (error) {
			console.error("Failed to delete wish:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-[#141e30] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 border border-slate-700/50">
				<div className="sticky top-0 bg-[#141e30] border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-2xl">🎁</span>
						<h2 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
							Wish Details
						</h2>
					</div>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-red-400 transition p-1 hover:bg-slate-800/50 rounded cursor-pointer"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-6 space-y-6">
					{editing ? (
						<>
							<div>
								<label className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide">
									Title
								</label>
								<input
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="w-full px-4 py-2.5 border border-slate-600/50 bg-slate-800/50 rounded-lg focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none text-slate-100"
								/>
							</div>

							<div>
								<label className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide">
									Description
								</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={6}
									className="w-full px-4 py-2.5 border border-slate-600/50 bg-slate-800/50 rounded-lg focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none resize-none text-slate-100"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide">
										Priority
									</label>
									<select
										value={priority}
										onChange={(e) => setPriority(e.target.value as Priority)}
										className="w-full px-4 py-2.5 border border-slate-600/50 bg-slate-800/50 rounded-lg focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none capitalize text-slate-100"
									>
										<option value="low">❄️ Low</option>
										<option value="medium">⭐ Medium</option>
										<option value="high">🔥 High</option>
									</select>
								</div>

								<div>
									<label className="block text-sm text-amber-200/70 mb-2 font-light tracking-wide">
										Status
									</label>
									<select
										value={status}
										onChange={(e) => setStatus(e.target.value as Status)}
										className="w-full px-4 py-2.5 border border-slate-600/50 bg-slate-800/50 rounded-lg focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 outline-none text-slate-100"
									>
										<option value="pending">📬 Pending</option>
										<option value="in_progress">🔨 In Progress</option>
										<option value="granted">✨ Granted</option>
										<option value="denied">❄️ Denied</option>
									</select>
								</div>
							</div>
						</>
					) : (
						<>
							<div>
								<h3 className="text-2xl text-amber-100 mb-3">
									{wish.title}
								</h3>
								<p className="text-slate-400 whitespace-pre-wrap leading-relaxed">
									{wish.description}
								</p>
							</div>

							<div className="flex flex-wrap gap-3">
								<div
									className={`px-3 py-1.5 rounded border text-sm font-medium flex items-center gap-2 ${
										priorityColors[wish.priority]
									}`}
								>
									<span>{priorityEmoji[wish.priority]}</span>
									Priority: {wish.priority}
								</div>

								<div
									className={`px-3 py-1.5 rounded border text-sm font-medium flex items-center gap-2 ${
										statusColors[wish.status]
									}`}
								>
									<span>{statusEmoji[wish.status]}</span>
									Status: {wish.status.replace("_", " ")}
								</div>
							</div>

							{(wish.user || wish.name) && (
								<div className="bg-slate-800/30 rounded-lg p-4 space-y-2 border border-slate-700/30">
									<div className="flex items-center gap-2 text-sm text-slate-400">
										<User className="w-4 h-4 text-amber-400/70" />
										<span className="font-medium text-amber-200/70">
											Submitted by:
										</span>
										<span className="text-slate-300">
											{wish.user?.name || wish.name}
										</span>
									</div>
									{wish.user?.email && (
										<div className="flex items-center gap-2 text-sm text-slate-400">
											<Calendar className="w-4 h-4 text-amber-400/70" />
											<span className="font-medium text-amber-200/70">
												Email:
											</span>
											<span className="text-slate-300">{wish.user.email}</span>
										</div>
									)}
								</div>
							)}

							{wish.created_at && (
								<div className="text-xs text-slate-500">
									🕐 Created: {new Date(wish.created_at).toLocaleString()}
								</div>
							)}
						</>
					)}

					<div className="flex gap-3 pt-6 border-t border-slate-700/50">
						{editing ? (
							<>
								<button
									onClick={handleSave}
									disabled={loading}
									className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/30 border border-emerald-600/30 flex items-center justify-center gap-2"
								>
									<Save className="w-4 h-4" />
									{loading ? "Saving..." : "Save Changes"}
								</button>
								<button
									onClick={() => {
										setEditing(false);
										setTitle(wish.title);
										setDescription(wish.description);
										setPriority(wish.priority);
										setStatus(wish.status);
									}}
									className="px-6 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium rounded-lg transition border border-slate-600/30"
								>
									Cancel
								</button>
							</>
						) : (
							<>
								<button
									onClick={() => setEditing(true)}
									className="flex-1 py-2.5 px-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-red-900/30 border border-red-600/30"
								>
									✏️ Edit Wish
								</button>
								<button
									onClick={handleDelete}
									disabled={loading}
									className={`px-4 py-2.5 font-medium rounded-lg transition flex items-center gap-2 ${
										deleteConfirm
											? "bg-red-600 hover:bg-red-500 text-white border border-red-500"
											: "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-600/30"
									}`}
								>
									<Trash2 className="w-4 h-4" />
									{deleteConfirm ? "Confirm" : "Delete"}
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
