'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Priority, Status, Wish } from '@/types';
import LocationsMap from '@/components/LocationsMap';

export type WishLocation = {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  name?: string;
  priority: Priority;
};

export default function LocationsPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');

  useEffect(() => {
    const loadWishes = async () => {
      try {
        const data = await api.wishes.getAll();
        setWishes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load wishes:', err);
        setError('Unable to load wish locations right now.');
      } finally {
        setLoading(false);
      }
    };

    loadWishes();
  }, []);

  const filteredWishes = useMemo(() => {
    if (statusFilter === 'all') return wishes;
    return wishes.filter((wish) => wish.status === statusFilter);
  }, [statusFilter, wishes]);

  const wishesWithCoords = useMemo<WishLocation[]>(() => {
    return filteredWishes
      .map((wish) => {
        const latitude =
          wish.latitude != null
            ? Number(wish.latitude)
            : null;
        const longitude =
          wish.longitude != null
            ? Number(wish.longitude)
            : null;

        if (latitude == null || longitude == null) {
          return null;
        }

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
          return null;
        }

        return {
          id: wish.id,
          title: wish.title,
          latitude,
          longitude,
          name: wish.name,
          priority: wish.priority
        };
      })
      .filter(Boolean) as WishLocation[];
  }, [filteredWishes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Locations</h1>
        <p className="text-slate-600">
          See all wish submissions on a single map
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Wish map</h2>
            <p className="text-sm text-slate-600">
              Showing {wishesWithCoords.length} wish
              {wishesWithCoords.length === 1 ? '' : 'es'} with coordinates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-slate-600">
              Status
            </label>
            <select
              id="status-filter"
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | Status)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="granted">Granted</option>
              <option value="denied">Denied</option>
            </select>
          </div>
        </div>

        {wishesWithCoords.length === 0 ? (
          <div className="text-center text-slate-500 py-16">
            No wish locations available yet.
          </div>
        ) : (
          <LocationsMap wishes={wishesWithCoords} />
        )}
      </div>
    </div>
  );
}
