'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Gift, Package, Clock, CheckCircle, XCircle, Loader2, Snowflake, Info, MapPin, Map, Cookie, Send, Calendar, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { WishTrackingInfo, Status } from '@/types';

// Santa's assumptions
const NORTH_POLE = { lat: 90, lng: 0 };
const SANTA_DEPARTURE = { month: 11, day: 24, hour: 0 }; // December 24th at midnight
const SLEIGH_SPEED_KMH = 10_000_000; // ~10 million km/h to visit all children in one night

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

interface ETAInfo {
  departureTime: Date;
  arrivalTime: Date;
  distanceKm: number;
  flightTimeMinutes: number;
}


// Calculate air distance using Haversine formula
function calculateAirDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getChristmasEve(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  let christmasEve = new Date(currentYear, SANTA_DEPARTURE.month, SANTA_DEPARTURE.day, SANTA_DEPARTURE.hour, 0, 0);

  if (now > christmasEve) {
    christmasEve = new Date(currentYear + 1, SANTA_DEPARTURE.month, SANTA_DEPARTURE.day, SANTA_DEPARTURE.hour, 0, 0);
  }

  return christmasEve;
}

function calculateTimeLeftUntil(targetDate: Date): TimeLeft | null {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    totalMs: difference,
  };
}

function calculateETA(coords: { lat: number; lng: number }): ETAInfo {
  const departureTime = getChristmasEve();
  const distanceKm = calculateAirDistance(NORTH_POLE.lat, NORTH_POLE.lng, coords.lat, coords.lng);
  const flightTimeHours = distanceKm / SLEIGH_SPEED_KMH;
  const flightTimeMinutes = Math.round(flightTimeHours * 60);

  const arrivalTime = new Date(departureTime.getTime() + flightTimeMinutes * 60 * 1000);

  return {
    departureTime,
    arrivalTime,
    distanceKm,
    flightTimeMinutes,
  };
}

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
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [etaInfo, setEtaInfo] = useState<ETAInfo | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  // Bribe states
  const [showBribeForm, setShowBribeForm] = useState(false);
  const [bribeOffer, setBribeOffer] = useState('');
  const [bribeSubmitting, setBribeSubmitting] = useState(false);
  const [bribeMessage, setBribeMessage] = useState<string | null>(null);

  
  // Fetch wish data
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

  // Geocode address when wish is loaded
  useEffect(() => {
    if (!wish) return;

    const tryGeocode = () => {
      if (typeof google !== 'undefined' && google.maps) {
        const geocoder = new google.maps.Geocoder();
        const addressString = `${wish.street} ${wish.house_number}, ${wish.postal_code} ${wish.city}, ${wish.country}`;

        geocoder.geocode({ address: addressString }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const newCoords = { lat: location.lat(), lng: location.lng() };
            setCoords(newCoords);
            setEtaInfo(calculateETA(newCoords));
          } else {
            // Fallback: use default distance (~5000 km from North Pole)
            const fallbackCoords = { lat: 50, lng: 10 }; // Central Europe approx
            setCoords(fallbackCoords);
            setEtaInfo(calculateETA(fallbackCoords));
          }
        });
      } else {
        // Google Maps not available, use fallback
        const fallbackCoords = { lat: 50, lng: 10 }; // Central Europe approx
        setCoords(fallbackCoords);
        setEtaInfo(calculateETA(fallbackCoords));
      }
    };

    // Load Google Maps script if not available
    if (typeof google === 'undefined' || !google.maps) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey && !document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => tryGeocode();
        document.head.appendChild(script);
      } else {
        // No API key or script already loading, use fallback
        tryGeocode();
      }
    } else {
      tryGeocode();
    }
  }, [wish]);

  // Countdown timer effect
  useEffect(() => {
    if (!etaInfo) return;

    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeftUntil(etaInfo.arrivalTime));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [etaInfo]);

  // Initialize map when coords are available
  useEffect(() => {
    if (!coords || !mapRef.current || mapInstanceRef.current) return;

    // Check if Google Maps is available
    if (typeof google === 'undefined' || !google.maps) {
      setMapReady(false);
      return;
    }

    // Use a point closer to actual North Pole for visual representation
    // (Google Maps doesn't render well at exactly 90°N)
    const visualNorthPole = { lat: 84, lng: 0 };

    // Calculate center point between North Pole and destination
    const centerLat = (visualNorthPole.lat + coords.lat) / 2;
    const centerLng = (visualNorthPole.lng + coords.lng) / 2;

    // Create the map
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: 2,
      backgroundColor: '#0f172a',
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
        { featureType: 'road', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
        { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
      ],
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
      restriction: {
        latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
        strictBounds: false,
      },
    });

    mapInstanceRef.current = map;

    // North Pole marker (Santa's workshop)
    new google.maps.Marker({
      position: visualNorthPole,
      map,
      title: "Santa's Workshop - North Pole",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });

    // Destination marker
    new google.maps.Marker({
      position: coords,
      map,
      title: 'Delivery Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#22c55e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });

    // Draw the flight path (geodesic line)
    new google.maps.Polyline({
      path: [visualNorthPole, coords],
      geodesic: true,
      strokeColor: '#f59e0b',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 4,
            strokeColor: '#f59e0b',
            fillColor: '#f59e0b',
            fillOpacity: 1,
          },
          offset: '50%',
        },
      ],
    });

    // Fit bounds to show both points with minimal padding
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(visualNorthPole);
    bounds.extend(coords);
    map.fitBounds(bounds, { top: 20, bottom: 20, left: 20, right: 20 });

    // Ensure map doesn't zoom out too far (max zoom level for world view)
    google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      const currentZoom = map.getZoom();
      if (currentZoom && currentZoom < 2) {
        map.setZoom(2);
      }
    });

    setMapReady(true);
  }, [coords]);

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
      <div className="max-w-lg mx-auto pt-8">
        {/* Assumptions Banner */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-300 mb-2">Santa&apos;s Flight Assumptions</h3>
              <ul className="text-xs text-blue-200/80 space-y-1">
                <li>• Departure: North Pole (90°N) on December 24th at midnight</li>
                <li>• Sleigh Speed: ~10 million km/h (magic-powered!)</li>
                <li>• Route: Direct flight path to your location</li>
                {etaInfo && (
                  <li>• Distance to you: {Math.round(etaInfo.distanceKm).toLocaleString()} km</li>
                )}
              </ul>
            </div>
          </div>
        </div>

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
            <p className="text-slate-600 mb-2">{wish.product_name}</p>

            {/* Delivery Address */}
            <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
              <MapPin className="w-3 h-3" />
              <span>{wish.city}, {wish.country}</span>
            </div>

            {/* Timeline/Progress */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                Progress
              </h3>
              <div className="flex items-center">
                {(['pending', 'in_progress', 'granted'] as Status[]).map((step, index) => {
                  const isActive = wish.status === step;
                  const isPast =
                    (wish.status === 'in_progress' && step === 'pending') ||
                    (wish.status === 'granted' && (step === 'pending' || step === 'in_progress'));
                  const isDenied = wish.status === 'denied';
                  const labels = ['Submitted', 'Preparing', 'Granted'];

                  return (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      {/* Connector line - before circle */}
                      {index > 0 && (
                        <div
                          className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                            isPast || isActive ? 'bg-green-200' : 'bg-slate-200'
                          }`}
                        />
                      )}
                      {/* Circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
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
                        ) : isActive ? (
                          <div className={`w-2 h-2 rounded-full ${
                            step === 'pending' ? 'bg-amber-500' :
                            step === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'
                          }`} />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      {/* Label */}
                      <span className="text-xs text-slate-500 mt-2">{labels[index]}</span>
                    </div>
                  );
                })}
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

            {/* Granted Message with ETA Countdown */}
            {wish.status === 'granted' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-3">
                  <Snowflake className="w-4 h-4" />
                  <span>Estimated Arrival Time</span>
                </div>

                {etaInfo && (
                  <div className="mb-4 p-3 bg-white rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Your gift will arrive at</p>
                      <p className="text-lg font-bold text-green-600">
                        {etaInfo.arrivalTime.toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        ({etaInfo.flightTimeMinutes < 1 ? '< 1' : etaInfo.flightTimeMinutes} min flight from North Pole)
                      </p>
                    </div>
                  </div>
                )}

                {/* Queue Position with Christmas Animation */}
                {wish.queue_position && wish.total_in_queue && (
                  <div className="mb-4 rounded-xl relative overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

                    {/* Animated aurora effect */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 animate-aurora" />
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0 animate-aurora-delayed" />
                    </div>

                    {/* Twinkling stars */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.2}s`,
                            animationDuration: `${1.5 + Math.random() * 2}s`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Gentle falling snow */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white/60 rounded-full animate-snow"
                          style={{
                            left: `${(i * 7) % 100}%`,
                            animationDelay: `${i * 0.4}s`,
                            animationDuration: `${4 + (i % 3) * 2}s`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Position badge with ring animation */}
                          <div className="relative">
                            <div className={`absolute inset-0 rounded-full animate-ping-slow ${
                              wish.queue_position === 1 ? 'bg-amber-400/30' : 'bg-green-400/20'
                            }`} />
                            <div className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                              wish.queue_position === 1
                                ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500'
                                : wish.queue_position <= 3
                                ? 'bg-gradient-to-br from-emerald-400 to-green-600'
                                : 'bg-gradient-to-br from-red-400 to-rose-600'
                            }`}>
                              <span className="text-white font-bold text-xl drop-shadow-lg">#{wish.queue_position}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-base font-semibold text-white">
                              {wish.queue_position === 1
                                ? "You're Next!"
                                : wish.queue_position <= 3
                                ? "Almost There"
                                : "In Santa's Queue"}
                            </p>
                            <p className="text-sm text-slate-300">
                              {wish.queue_position === 1
                                ? "Santa is heading your way"
                                : `${wish.queue_position - 1} delivery${wish.queue_position - 1 === 1 ? '' : 's'} before you`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-400 uppercase tracking-wide">Total</p>
                          <p className="text-2xl font-bold text-white">{wish.total_in_queue}</p>
                          <p className="text-xs text-slate-400">wishes</p>
                        </div>
                      </div>

                      {/* Progress track */}
                      <div className="mt-5">
                        <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                          {/* Track glow */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                          {/* Progress fill */}
                          <div
                            className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                            style={{ width: `${Math.max(8, (wish.queue_position / wish.total_in_queue) * 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-400 to-green-400" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                          </div>

                          {/* Santa's sleigh indicator */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                            style={{ left: `${Math.max(4, (wish.queue_position / wish.total_in_queue) * 100)}%` }}
                          >
                            <div className="relative -translate-x-1/2">
                              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-lg shadow-red-500/50 flex items-center justify-center animate-float">
                                <div className="w-3 h-3 bg-white rounded-full" />
                              </div>
                              {/* Sleigh trail */}
                              <div className="absolute top-1/2 right-full -translate-y-1/2 w-8 h-0.5 bg-gradient-to-l from-amber-400/80 to-transparent" />
                            </div>
                          </div>
                        </div>

                        {/* Labels */}
                        <div className="flex justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-xs text-slate-400">North Pole</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400">Your Home</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CSS for animations */}
                <style jsx>{`
                  @keyframes aurora {
                    0%, 100% {
                      transform: translateX(-100%) skewX(-15deg);
                    }
                    50% {
                      transform: translateX(100%) skewX(-15deg);
                    }
                  }
                  @keyframes aurora-delayed {
                    0%, 100% {
                      transform: translateX(100%) skewX(15deg);
                    }
                    50% {
                      transform: translateX(-100%) skewX(15deg);
                    }
                  }
                  @keyframes twinkle {
                    0%, 100% {
                      opacity: 0.2;
                      transform: scale(1);
                    }
                    50% {
                      opacity: 1;
                      transform: scale(1.5);
                    }
                  }
                  @keyframes snow {
                    0% {
                      transform: translateY(-10px) translateX(0);
                      opacity: 0;
                    }
                    10% {
                      opacity: 1;
                    }
                    90% {
                      opacity: 1;
                    }
                    100% {
                      transform: translateY(150px) translateX(20px);
                      opacity: 0;
                    }
                  }
                  @keyframes shimmer {
                    0% {
                      transform: translateX(-100%);
                    }
                    100% {
                      transform: translateX(100%);
                    }
                  }
                  @keyframes float {
                    0%, 100% {
                      transform: translateY(0);
                    }
                    50% {
                      transform: translateY(-3px);
                    }
                  }
                  @keyframes ping-slow {
                    0% {
                      transform: scale(1);
                      opacity: 0.5;
                    }
                    100% {
                      transform: scale(1.5);
                      opacity: 0;
                    }
                  }
                  .animate-aurora {
                    animation: aurora 8s ease-in-out infinite;
                  }
                  .animate-aurora-delayed {
                    animation: aurora-delayed 10s ease-in-out infinite;
                  }
                  .animate-twinkle {
                    animation: twinkle ease-in-out infinite;
                  }
                  .animate-snow {
                    animation: snow linear infinite;
                  }
                  .animate-shimmer {
                    animation: shimmer 2s ease-in-out infinite;
                  }
                  .animate-float {
                    animation: float 2s ease-in-out infinite;
                  }
                  .animate-ping-slow {
                    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                  }
                `}</style>

                {timeLeft && (
                  <>
                    <p className="text-xs text-green-600 mb-3 text-center">Time until delivery:</p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{timeLeft.days}</div>
                        <div className="text-xs text-slate-500">Days</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{timeLeft.hours}</div>
                        <div className="text-xs text-slate-500">Hours</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{timeLeft.minutes}</div>
                        <div className="text-xs text-slate-500">Min</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{timeLeft.seconds}</div>
                        <div className="text-xs text-slate-500">Sec</div>
                      </div>
                    </div>
                  </>
                )}

                {!timeLeft && (
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-green-700 font-medium">Santa is on his way!</p>
                  </div>
                )}
              </div>
            )}

            
            {/* Route Map */}
            {wish.status === 'granted' && coords && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium mb-3">
                  <Map className="w-4 h-4" />
                  <span>Santa&apos;s Flight Route</span>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <div ref={mapRef} className="w-full h-64 [&_.gm-style>div]:!bg-slate-900" />
                  {/* Map Legend */}
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs shadow-md">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                      <span className="text-slate-600">North Pole</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                      <span className="text-slate-600">Your Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5 bg-amber-500" />
                      <span className="text-slate-600">Flight Path</span>
                    </div>
                  </div>
                  {/* Distance Badge */}
                  {etaInfo && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs shadow-md">
                      <span className="text-slate-600">{Math.round(etaInfo.distanceKm).toLocaleString()} km</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bribe Santa Section */}
            {wish.status === 'granted' && wish.queue_position && wish.queue_position > 1 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                {!wish.bribe_offer ? (
                  // No bribe submitted yet
                  <>
                    {!showBribeForm ? (
                      <button
                        type="button"
                        onClick={() => setShowBribeForm(true)}
                        className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-xl transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Cookie className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-amber-800">Want to skip the queue?</p>
                              <p className="text-xs text-amber-600">Make an offer Santa can&apos;t refuse...</p>
                            </div>
                          </div>
                          <div className="text-amber-500">
                            <Send className="w-5 h-5" />
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-800 font-medium mb-3">
                          <Cookie className="w-4 h-4" />
                          <span>Make an Offer to Santa</span>
                        </div>
                        <p className="text-xs text-amber-600 mb-3">
                          What will you leave for Santa? Cookies? Milk? Carrots for the reindeer?
                        </p>
                        <textarea
                          value={bribeOffer}
                          onChange={(e) => setBribeOffer(e.target.value)}
                          placeholder="e.g., 12 chocolate chip cookies, a tall glass of cold milk, and fresh carrots for Rudolph..."
                          className="w-full p-3 border border-amber-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowBribeForm(false);
                              setBribeOffer('');
                            }}
                            className="text-sm text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!bribeOffer.trim()) return;
                              setBribeSubmitting(true);
                              try {
                                const result = await api.wishes.submitBribe(Number(id), bribeOffer);
                                setBribeMessage(result.message);
                                // Refresh wish data
                                const updatedWish = await api.wishes.track(Number(id));
                                setWish(updatedWish);
                                setShowBribeForm(false);
                              } catch (err) {
                                setBribeMessage('Failed to send offer. Please try again.');
                              } finally {
                                setBribeSubmitting(false);
                              }
                            }}
                            disabled={bribeSubmitting || !bribeOffer.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                          >
                            {bribeSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Send to Santa
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Bribe already submitted - show status
                  <div className={`p-4 rounded-xl border ${
                    wish.bribe_status === 'accepted'
                      ? 'bg-green-50 border-green-200'
                      : wish.bribe_status === 'rejected'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        wish.bribe_status === 'accepted'
                          ? 'bg-green-100'
                          : wish.bribe_status === 'rejected'
                          ? 'bg-red-100'
                          : 'bg-amber-100'
                      }`}>
                        {wish.bribe_status === 'accepted' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : wish.bribe_status === 'rejected' ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          wish.bribe_status === 'accepted'
                            ? 'text-green-800'
                            : wish.bribe_status === 'rejected'
                            ? 'text-red-800'
                            : 'text-amber-800'
                        }`}>
                          {wish.bribe_status === 'accepted'
                            ? 'Offer Accepted!'
                            : wish.bribe_status === 'rejected'
                            ? 'Offer Declined'
                            : 'Offer Pending Review'}
                        </p>
                        <p className={`text-sm mt-1 ${
                          wish.bribe_status === 'accepted'
                            ? 'text-green-600'
                            : wish.bribe_status === 'rejected'
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}>
                          {wish.bribe_status === 'accepted'
                            ? 'Ho ho ho! Santa loved your offer and will prioritize your delivery!'
                            : wish.bribe_status === 'rejected'
                            ? 'Santa appreciates your offer but prefers to keep things fair.'
                            : 'Santa is reviewing your generous offer...'}
                        </p>
                        <div className="mt-3 p-2 bg-white/50 rounded-lg">
                          <p className="text-xs text-slate-500">Your offer:</p>
                          <p className="text-sm text-slate-700 italic">&quot;{wish.bribe_offer}&quot;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {bribeMessage && !wish.bribe_offer && (
                  <p className="mt-2 text-sm text-center text-amber-600">{bribeMessage}</p>
                )}
              </div>
            )}

            {/* Advent Calendar Link */}
            {wish.status === 'granted' && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <Link
                  href={`/track/${id}/advent`}
                  className="block p-4 bg-gradient-to-r from-red-50 via-amber-50 to-green-50 hover:from-red-100 hover:via-amber-100 hover:to-green-100 border border-red-200 rounded-xl transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <Calendar className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">Advent Calendar</p>
                        <p className="text-sm text-slate-600">
                          Open a door each day to discover videos about your gift!
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-red-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
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
