'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Gift, Package, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { WishTrackingInfo, Status } from '@/types';

const statusConfig: Record<Status, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  in_progress: {
    label: 'Being Prepared',
    icon: Package,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  granted: {
    label: 'Wish Granted!',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  denied: {
    label: 'Unable to Grant',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
};

export default function TrackWishPage() {
  const params = useParams();
  const id = params.id as string;

  const [wish, setWish] = useState<WishTrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWish = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.wishes.track(Number(id));
        setWish(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wish status');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWish();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
          <p className="mt-4 text-slate-300">Loading your wish...</p>
        </div>
      </div>
    );
  }

  if (error || !wish) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-white">Wish Not Found</h1>
          <p className="mt-2 text-slate-300">
            {error || "We couldn't find this wish. Please check your tracking link."}
          </p>
        </div>
      </div>
    );
  }

  const status = statusConfig[wish.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-lg mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
            <Gift className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Wish Tracker</h1>
          <p className="text-slate-400 mt-2">Track the status of your Christmas wish</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Product Image */}
          {wish.product_image && (
            <div className="bg-slate-50 p-6 flex items-center justify-center">
              <img
                src={wish.product_image}
                alt={wish.product_name}
                className="max-h-48 object-contain"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.color} mb-4`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-medium">{status.label}</span>
            </div>

            {/* Wish Details */}
            <h2 className="text-xl font-bold text-slate-900 mb-2">{wish.title}</h2>
            <p className="text-slate-600 mb-4">{wish.product_name}</p>

            {/* Timeline/Progress */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                Progress
              </h3>
              <div className="flex items-center gap-2">
                {(['pending', 'in_progress', 'granted'] as Status[]).map((step, index) => {
                  const isActive = wish.status === step;
                  const isPast =
                    (wish.status === 'in_progress' && step === 'pending') ||
                    (wish.status === 'granted' && (step === 'pending' || step === 'in_progress'));
                  const isDenied = wish.status === 'denied';

                  return (
                    <div key={step} className="flex-1 flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDenied && step !== 'pending'
                            ? 'bg-slate-100'
                            : isActive
                            ? statusConfig[step].bg
                            : isPast
                            ? 'bg-green-100'
                            : 'bg-slate-100'
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : isDenied && step !== 'pending' ? (
                          <div className="w-2 h-2 rounded-full bg-slate-300" />
                        ) : (
                          <span className={`text-sm font-medium ${
                            isActive ? statusConfig[step].color : 'text-slate-400'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      {index < 2 && (
                        <div className={`flex-1 h-1 mx-2 rounded ${
                          isPast ? 'bg-green-200' : 'bg-slate-100'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-500">Submitted</span>
                <span className="text-xs text-slate-500">Preparing</span>
                <span className="text-xs text-slate-500">Granted</span>
              </div>
            </div>

            {/* Denied Message */}
            {wish.status === 'denied' && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  Unfortunately, Santa was unable to grant this wish this year.
                  Keep being good and try again next Christmas!
                </p>
              </div>
            )}

            {/* Granted Message */}
            {wish.status === 'granted' && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  Great news! Your wish has been granted.
                  Santa&apos;s elves are preparing your gift for delivery!
                </p>
              </div>
            )}

            {/* Submitted Date */}
            <p className="mt-6 text-xs text-slate-400 text-center">
              Wish submitted on {new Date(wish.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Bookmark this page to check back later!
        </p>
      </div>
    </div>
  );
}
