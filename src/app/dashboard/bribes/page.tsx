'use client';

import { useEffect, useState } from 'react';
import { Cookie, CheckCircle, XCircle, Clock, MapPin, Gift, Loader2 } from 'lucide-react';
import type { BribeStatus } from '@/types';

interface Bribe {
  id: number;
  name: string;
  title: string;
  city: string;
  country: string;
  product_name: string;
  bribe_offer: string;
  bribe_status: BribeStatus;
  bribe_submitted_at: string;
}

export default function BribesPage() {
  const [bribes, setBribes] = useState<Bribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);

  const fetchBribes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://santa.test/api/wishes/bribes', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBribes(data.bribes);
      }
    } catch (error) {
      console.error('Failed to fetch bribes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBribes();
  }, []);

  const handleRespond = async (wishId: number, status: 'accepted' | 'rejected') => {
    setResponding(wishId);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`https://santa.test/api/wishes/${wishId}/bribe`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh the list
        await fetchBribes();
      }
    } catch (error) {
      console.error('Failed to respond to bribe:', error);
    } finally {
      setResponding(null);
    }
  };

  const pendingBribes = bribes.filter((b) => b.bribe_status === 'pending');
  const respondedBribes = bribes.filter((b) => b.bribe_status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <Cookie className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bribe Offers</h1>
          <p className="text-slate-500">Review what children are offering for priority delivery</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{pendingBribes.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Accepted</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {bribes.filter((b) => b.bribe_status === 'accepted').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Declined</span>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {bribes.filter((b) => b.bribe_status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Pending Bribes */}
      {pendingBribes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Pending Review</h2>
          <div className="space-y-3">
            {pendingBribes.map((bribe) => (
              <div
                key={bribe.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-900">{bribe.name}</span>
                      <span className="text-slate-400">-</span>
                      <span className="text-slate-600">{bribe.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{bribe.city}, {bribe.country}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        <span>{bribe.product_name}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-xs text-amber-600 mb-1">Their offer:</p>
                      <p className="text-slate-800 italic">&quot;{bribe.bribe_offer}&quot;</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleRespond(bribe.id, 'accepted')}
                      disabled={responding === bribe.id}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {responding === bribe.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(bribe.id, 'rejected')}
                      disabled={responding === bribe.id}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responded Bribes */}
      {respondedBribes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Previous Responses</h2>
          <div className="space-y-2">
            {respondedBribes.map((bribe) => (
              <div
                key={bribe.id}
                className={`rounded-xl border p-4 ${
                  bribe.bribe_status === 'accepted'
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">{bribe.name}</span>
                      <span className="text-slate-400">-</span>
                      <span className="text-slate-600 text-sm">{bribe.title}</span>
                    </div>
                    <p className="text-sm text-slate-500 italic truncate max-w-md">
                      &quot;{bribe.bribe_offer}&quot;
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    bribe.bribe_status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {bribe.bribe_status === 'accepted' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Accepted</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Declined</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bribes.length === 0 && (
        <div className="text-center py-12">
          <Cookie className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No bribe offers yet</p>
          <p className="text-sm text-slate-400">Children haven&apos;t tried to skip the queue</p>
        </div>
      )}
    </div>
  );
}
