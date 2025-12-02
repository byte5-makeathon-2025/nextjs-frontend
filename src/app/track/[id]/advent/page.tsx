'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Gift, Loader2, Play, X, Lock, Star, ArrowLeft, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import type { WishTrackingInfo } from '@/types';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export default function AdventCalendarPage() {
  const params = useParams();
  const id = params.id as string;

  const [wish, setWish] = useState<WishTrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [openedDays, setOpenedDays] = useState<number[]>([]);

  // Fetch wish data
  useEffect(() => {
    const fetchWish = async () => {
      try {
        setLoading(true);
        const data = await api.wishes.track(Number(id));
        setWish(data);
      } catch {
        console.error('Failed to load wish');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWish();
    }
  }, [id]);

  // Fetch YouTube videos
  useEffect(() => {
    if (!wish?.product_name) return;

    const fetchVideos = async () => {
      setVideosLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        if (!apiKey) {
          console.warn('YouTube API key not configured');
          return;
        }

        const searchQueries = [
          `${wish.product_name} unboxing`,
          `${wish.product_name} review`,
          `${wish.product_name} features`,
          `${wish.product_name} tips tricks`,
        ];

        const allVideos: YouTubeVideo[] = [];

        for (const query of searchQueries) {
          if (allVideos.length >= 24) break;

          const searchQuery = encodeURIComponent(query);
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=8&videoEmbeddable=true&key=${apiKey}`
          );

          if (response.ok) {
            const data = await response.json();
            const videoResults: YouTubeVideo[] = data.items
              .filter((item: { id: { videoId: string } }) => !allVideos.some(v => v.id === item.id.videoId))
              .map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { medium: { url: string } }; channelTitle: string } }) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium.url,
                channelTitle: item.snippet.channelTitle,
              }));
            allVideos.push(...videoResults);
          }
        }

        const shuffled = allVideos.sort(() => Math.random() - 0.5).slice(0, 24);
        setVideos(shuffled);

        const savedDays = localStorage.getItem(`advent-${id}`);
        if (savedDays) {
          setOpenedDays(JSON.parse(savedDays));
        }
      } catch (error) {
        console.error('Failed to fetch YouTube videos:', error);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, [wish?.product_name, id]);

  // Calculate days until Christmas
  const today = new Date();
  const christmas = new Date(today.getFullYear(), 11, 25);
  if (today > christmas) {
    christmas.setFullYear(christmas.getFullYear() + 1);
  }
  const daysUntilChristmas = Math.ceil((christmas.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-400 animate-spin mx-auto" />
          <p className="mt-4 text-slate-300">Loading advent calendar...</p>
        </div>
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950/20 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-300">Could not load wish data.</p>
          <Link href={`/track/${id}`} className="text-red-400 hover:text-red-300 mt-4 inline-block">
            ← Back to Wish Tracker
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950/20 to-slate-900">
      {/* Falling snow effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-snow"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/track/${id}`}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Wish Tracker</span>
            </Link>

            <div className="flex items-center gap-2 text-slate-400">
              <Gift className="w-5 h-5 text-red-400" />
              <span className="hidden sm:inline">{wish.product_name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-8 sm:py-12">
        {/* Title Section */}
        <div className="text-center mb-10 px-4">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Advent Calendar</h1>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-slate-400 max-w-lg mx-auto text-lg">
            Open a door each day to discover exciting videos about your gift!
          </p>
          {daysUntilChristmas > 0 && daysUntilChristmas <= 25 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span className="text-emerald-300 font-medium">
                {daysUntilChristmas} {daysUntilChristmas === 1 ? 'day' : 'days'} until Christmas!
              </span>
            </div>
          )}
        </div>

        {/* Generate shuffled days once based on wish id (deterministic shuffle) */}
        {(() => {
          // Create a seeded shuffle based on the wish id for consistent randomization
          const seedRandom = (seed: number) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
          };

          const shuffleDays = (seed: number): number[] => {
            const days = Array.from({ length: 24 }, (_, i) => i + 1);
            // Fisher-Yates shuffle with seeded random
            for (let i = days.length - 1; i > 0; i--) {
              const j = Math.floor(seedRandom(seed + i) * (i + 1));
              [days[i], days[j]] = [days[j], days[i]];
            }
            return days;
          };

          const shuffledDays = shuffleDays(Number(id) || 1);

          return videosLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <span className="ml-4 text-slate-400 text-lg">Preparing your advent calendar...</span>
          </div>
        ) : (
          /* Advent Calendar Grid - 6 columns x 4 rows with randomized days */
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4">
              {shuffledDays.map((day) => {
                const currentDay = today.getMonth() === 11 ? today.getDate() : 0;
                const isUnlocked = day <= currentDay || currentDay === 0; // Unlock all if not December
                const isOpened = openedDays.includes(day);
                const video = videos[day - 1]; // Use day-1 to get the correct video for this day

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      if (isUnlocked && video) {
                        setSelectedDay(day);
                        setSelectedVideo(video.id);
                        if (!openedDays.includes(day)) {
                          const newOpenedDays = [...openedDays, day];
                          setOpenedDays(newOpenedDays);
                          localStorage.setItem(`advent-${id}`, JSON.stringify(newOpenedDays));
                        }
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`
                      relative aspect-square rounded-2xl overflow-hidden
                      transition-all duration-300 transform
                      ${isUnlocked ? 'hover:scale-105 hover:z-10 cursor-pointer hover:shadow-2xl hover:shadow-red-500/20' : 'cursor-not-allowed opacity-60'}
                      ${isOpened ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' : ''}
                    `}
                  >
                    {/* Door background */}
                    <div className={`absolute inset-0 ${
                      isOpened
                        ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800'
                        : isUnlocked
                        ? 'bg-gradient-to-br from-red-600 via-red-700 to-rose-900'
                        : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
                    }`}>
                      {/* Decorative patterns */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 30% 70%, rgba(255,255,255,0.2) 0%, transparent 50%),
                                          radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)`
                        }} />
                      </div>
                      {/* Snow on top */}
                      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-white/50 to-transparent rounded-t-2xl" />
                    </div>

                    {/* Video thumbnail preview */}
                    {isOpened && video && (
                      <div className="absolute inset-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent" />
                      </div>
                    )}

                    {/* Day number and status */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <span className="text-3xl sm:text-4xl font-bold drop-shadow-lg text-white/95">
                        {day}
                      </span>

                      {!isUnlocked && (
                        <Lock className="w-4 h-4 text-white/50 mt-2" />
                      )}
                      {isOpened && (
                        <div className="flex items-center gap-1 mt-2 bg-black/30 px-2 py-1 rounded-full">
                          <Play className="w-3 h-3 text-emerald-300 fill-emerald-300" />
                          <span className="text-xs text-emerald-300 font-medium">Watched</span>
                        </div>
                      )}
                      {isUnlocked && !isOpened && (
                        <span className="text-xs text-white/80 mt-2 font-medium bg-black/20 px-2 py-1 rounded-full">
                          Tap to open!
                        </span>
                      )}
                    </div>

                    {/* Hover shine effect */}
                    {isUnlocked && !isOpened && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                    )}

                    {/* Door frame */}
                    <div className="absolute inset-0 border-4 border-amber-900/40 rounded-2xl pointer-events-none" />

                    {/* Golden corners */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-yellow-500/60 rounded-tl-lg" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-yellow-500/60 rounded-tr-lg" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-yellow-500/60 rounded-bl-lg" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-500/60 rounded-br-lg" />
                  </button>
                );
              })}
            </div>

            {/* Progress indicator */}
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <Gift className="w-6 h-6 text-red-400" />
                <div className="text-left">
                  <p className="text-slate-400 text-sm">Progress</p>
                  <p className="text-white text-xl font-bold">
                    <span className="text-emerald-400">{openedDays.length}</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span>24</span>
                    <span className="text-slate-400 text-sm font-normal ml-2">doors opened</span>
                  </p>
                </div>
                {/* Progress bar */}
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${(openedDays.length / 24) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
        })()}
      </main>

      {/* Video Modal */}
      {selectedVideo && selectedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => {
            setSelectedVideo(null);
            setSelectedDay(null);
          }}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setSelectedVideo(null);
                setSelectedDay(null);
              }}
              className="absolute -top-14 right-0 p-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-full"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Day badge */}
            <div className="absolute -top-14 left-0 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">{selectedDay}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">December {selectedDay}</p>
                <p className="text-slate-400 text-sm">Advent Calendar</p>
              </div>
            </div>

            {/* Video player */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl ring-1 ring-white/20">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video info */}
            {videos[selectedDay - 1] && (
              <div className="mt-6 text-center">
                <p className="text-white font-medium text-lg line-clamp-2">{videos[selectedDay - 1].title}</p>
                <p className="text-slate-400 mt-1">{videos[selectedDay - 1].channelTitle}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS for snow animation */}
      <style jsx>{`
        @keyframes snow {
          0% {
            transform: translateY(-10vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(50px);
            opacity: 0;
          }
        }
        .animate-snow {
          animation: snow linear infinite;
        }
      `}</style>
    </div>
  );
}
