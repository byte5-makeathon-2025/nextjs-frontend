"use client";

import { useEffect, useState, DragEvent } from "react";
import { api } from "@/lib/api";
import type { Wish, Status } from "@/types";
import { CheckCircle } from "lucide-react";
import WishCard from "@/components/WishCard";
import WishDetailsModal from "@/components/WishDetailsModal";

const statusConfig = {
  paid: {
    title: "Paid",
    icon: CheckCircle,
    color: "bg-purple-50 text-purple-900 border-purple-200",
  },
  granted: {
    title: "Granted",
    icon: CheckCircle,
    color: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
};

const PRIORITY_ORDER: Record<Wish["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
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
    } catch (error: any) {
      console.error("Failed to load wishes:", error);
      console.error("Error details:", error.message, error.status);
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
    wishes
      .filter((wish) => wish.status === status)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const handleDragStart = (wish: Wish) => {
    setDraggedWish(wish);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault(); // Allow drop
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

    // Optimistically update UI
    const updatedWish = { ...draggedWish, status: newStatus };
    setWishes((prev) =>
      prev.map((wish) => (wish.id === draggedWish.id ? updatedWish : wish))
    );
    setDraggedWish(null);

    // Update on server
    try {
      await api.wishes.update(draggedWish.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update wish status:", error);
      // Revert on error
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading wishes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Wishes</h1>
        <p className="text-slate-600">Manage and track all submitted wishes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 max-w-3xl">
        {(Object.keys(statusConfig) as Status[]).map((status) => {
          const config = statusConfig[status];
          const statusWishes = getWishesByStatus(status);
          const Icon = config.icon;

          return (
            <div key={status} className="flex flex-col">
              <div className={`rounded-lg border p-4 mb-4 ${config.color}`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <h2 className="font-semibold text-sm uppercase tracking-wide">
                    {config.title}
                  </h2>
                  <span className="ml-auto text-sm font-bold bg-white/60 px-2 py-0.5 rounded">
                    {statusWishes.length}
                  </span>
                </div>
              </div>

              <div
                className={`space-y-3 flex-1 min-h-[200px] rounded-lg transition-all ${
                  dragOverColumn === status
                    ? "bg-slate-100 border-2 border-dashed border-slate-400 p-2"
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
                  <div className="text-center py-8 text-gray-400 text-sm">
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
