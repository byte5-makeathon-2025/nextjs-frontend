'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, PolylineF } from '@react-google-maps/api';
import type { Wish, Status } from '@/types';
import { Navigation, MapPin, Clock, CheckCircle2, Gift, Route, Leaf, Info } from 'lucide-react';

const libraries: ('places')[] = ['places'];

interface WishesMapProps {
  wishes: Wish[];
  onWishClick?: (wish: Wish) => void;
}

interface GeocodedWish {
  wish: Wish;
  lat: number;
  lng: number;
}

interface RouteStop {
  index: number;
  geocodedWish?: GeocodedWish;
  isNorthPole?: boolean;
  distance?: string;
  duration?: string;
  co2?: string;
}

// North Pole - Santa's true starting point for air travel
const NORTH_POLE = { lat: 90, lng: 0 };

// Haversine formula to calculate air distance between two points
function calculateAirDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Santa's sleigh speed (magical, of course!)
const SLEIGH_SPEED_KMH = 1000; // km/h - fast but not instant, for dramatic effect

// Nearest neighbor algorithm for TSP (Traveling Santa Problem)
function optimizeRouteOrder(start: { lat: number; lng: number }, wishes: GeocodedWish[]): GeocodedWish[] {
  if (wishes.length <= 1) return wishes;

  const unvisited = [...wishes];
  const route: GeocodedWish[] = [];
  let current = start;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateAirDistance(current.lat, current.lng, unvisited[i].lat, unvisited[i].lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = unvisited.splice(nearestIdx, 1)[0];
    route.push(nearest);
    current = { lat: nearest.lat, lng: nearest.lng };
  }

  return route;
}

// Helper to format flight time
function formatFlightTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// CO2 calculation for Santa's sleigh
// Based on: 9 reindeer producing ~0.5 kg CO2/km each (from methane - reindeer are ruminants!)
// But magic dust reduces emissions by 90%, so effective rate is 0.45 kg CO2/km total
// For comparison: A plane emits ~0.255 kg CO2/km per passenger
const SLEIGH_CO2_PER_KM = 0.045; // kg CO2 per km (very eco-friendly magic!)

// Additional CO2 from cargo weight
// Based on: 0.001 kg CO2 per kg of cargo per km (air freight average, magic-adjusted)
const CARGO_CO2_PER_KG_KM = 0.001;

function calculateCO2(distanceKm: number): number {
  return distanceKm * SLEIGH_CO2_PER_KM;
}

// Calculate CO2 with cargo weight factored in
function calculateCO2WithWeight(distanceKm: number, weightKg: number): number {
  const baseCO2 = distanceKm * SLEIGH_CO2_PER_KM;
  const cargoCO2 = weightKg * distanceKm * CARGO_CO2_PER_KG_KM;
  return baseCO2 + cargoCO2;
}

// Helper to convert pounds to kg
function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

function formatCO2(kg: number): string {
  if (kg < 1) {
    return `${Math.round(kg * 1000)} g`;
  }
  return `${kg.toFixed(1)} kg`;
}

// Export for use in other components
export { calculateAirDistance, calculateCO2, calculateCO2WithWeight, formatCO2, lbsToKg, NORTH_POLE, SLEIGH_CO2_PER_KM, CARGO_CO2_PER_KG_KM };

const statusColors: Record<Status, string> = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  granted: '#10b981',
  denied: '#64748b',
};

const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  granted: 'Granted',
  denied: 'Denied',
};

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 51.1657,
  lng: 10.4515,
};

function createMarkerIcon(color: string, label?: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      ${label ? `<text x="12" y="12" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold" font-family="Arial">${label}</text>` : '<circle fill="#fff" cx="12" cy="9" r="2.5"/>'}
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function WishesMap({ wishes, onWishClick }: WishesMapProps) {
  const [geocodedWishes, setGeocodedWishes] = useState<GeocodedWish[]>([]);
  const [selectedWish, setSelectedWish] = useState<GeocodedWish | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStop[]>([]);
  const [totalDistance, setTotalDistance] = useState<string>('');
  const [totalDuration, setTotalDuration] = useState<string>('');
  const [totalCO2, setTotalCO2] = useState<string>('');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [showRoute, setShowRoute] = useState(true);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const geocodeCacheRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const geocodeAddress = useCallback(async (wish: Wish): Promise<GeocodedWish | null> => {
    if (!wish.street || !wish.city || !wish.country) {
      return null;
    }

    const addressString = `${wish.street} ${wish.house_number || ''}, ${wish.postal_code || ''} ${wish.city}, ${wish.country}`;

    const cached = geocodeCacheRef.current.get(addressString);
    if (cached) {
      return { wish, lat: cached.lat, lng: cached.lng };
    }

    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }

    return new Promise((resolve) => {
      geocoderRef.current!.geocode({ address: addressString }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const coords = { lat: location.lat(), lng: location.lng() };
          geocodeCacheRef.current.set(addressString, coords);
          resolve({ wish, lat: coords.lat, lng: coords.lng });
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  const calculateOptimizedRoute = useCallback((geocodedWishes: GeocodedWish[]) => {
    if (geocodedWishes.length === 0) {
      setOptimizedRoute([{ index: 0, isNorthPole: true }]);
      setRoutePath([NORTH_POLE]);
      return;
    }

    setIsCalculatingRoute(true);

    // Use nearest neighbor algorithm for optimal air route
    const orderedWishes = optimizeRouteOrder(NORTH_POLE, geocodedWishes);

    // Build the route stops with distances and flight times
    const routeStops: RouteStop[] = [];
    let totalDistanceKm = 0;

    // Add North Pole as starting point
    const firstDist = calculateAirDistance(NORTH_POLE.lat, NORTH_POLE.lng, orderedWishes[0].lat, orderedWishes[0].lng);
    const firstFlightTime = firstDist / SLEIGH_SPEED_KMH;
    const firstCO2 = calculateCO2(firstDist);
    routeStops.push({
      index: 0,
      isNorthPole: true,
      distance: `${Math.round(firstDist)} km`,
      duration: formatFlightTime(firstFlightTime),
      co2: formatCO2(firstCO2),
    });
    totalDistanceKm += firstDist;

    // Add each wish stop with cumulative CO2 from North Pole
    let cumulativeDistance = firstDist;
    orderedWishes.forEach((gw, idx) => {
      const nextWish = orderedWishes[idx + 1];
      let legDistance: string | undefined;
      let legDuration: string | undefined;

      if (nextWish) {
        const dist = calculateAirDistance(gw.lat, gw.lng, nextWish.lat, nextWish.lng);
        totalDistanceKm += dist;
        legDistance = `${Math.round(dist)} km`;
        legDuration = formatFlightTime(dist / SLEIGH_SPEED_KMH);
      }

      // CO2 to reach this stop from North Pole
      const stopCO2 = formatCO2(calculateCO2(cumulativeDistance));

      routeStops.push({
        index: idx + 1,
        geocodedWish: gw,
        distance: legDistance,
        duration: legDuration,
        co2: stopCO2, // CO2 emitted to reach this stop
      });

      if (nextWish) {
        const dist = calculateAirDistance(gw.lat, gw.lng, nextWish.lat, nextWish.lng);
        cumulativeDistance += dist;
      }
    });

    setOptimizedRoute(routeStops);

    // Build the path for the polyline
    const path = [
      NORTH_POLE,
      ...orderedWishes.map(gw => ({ lat: gw.lat, lng: gw.lng }))
    ];
    setRoutePath(path);

    // Set totals
    setTotalDistance(`${Math.round(totalDistanceKm)} km`);
    const totalHours = totalDistanceKm / SLEIGH_SPEED_KMH;
    setTotalDuration(formatFlightTime(totalHours));
    setTotalCO2(formatCO2(calculateCO2(totalDistanceKm)));

    setIsCalculatingRoute(false);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const geocodeWishes = async () => {
      const wishesWithAddress = wishes.filter(w => w.street && w.city && w.country);

      const results = await Promise.all(
        wishesWithAddress.map(wish => geocodeAddress(wish))
      );

      const validResults = results.filter((r): r is GeocodedWish => r !== null);
      setGeocodedWishes(validResults);

      if (validResults.length > 0) {
        const avgLat = validResults.reduce((sum, r) => sum + r.lat, 0) / validResults.length;
        const avgLng = validResults.reduce((sum, r) => sum + r.lng, 0) / validResults.length;
        setMapCenter({ lat: avgLat, lng: avgLng });

        calculateOptimizedRoute(validResults);
      }
    };

    geocodeWishes();
  }, [isLoaded, wishes, geocodeAddress, calculateOptimizedRoute]);

  const handleMarkerClick = (geocodedWish: GeocodedWish) => {
    setSelectedWish(geocodedWish);
  };

  const handleInfoWindowClose = () => {
    setSelectedWish(null);
  };

  const scrollToStop = (stop: RouteStop) => {
    if (stop.isNorthPole) {
      setSelectedWish(null);
      if (mapRef.current) {
        mapRef.current.panTo(NORTH_POLE);
        mapRef.current.setZoom(3);
      }
      return;
    }
    if (stop.geocodedWish) {
      setSelectedWish(stop.geocodedWish);
      if (mapRef.current) {
        mapRef.current.panTo({ lat: stop.geocodedWish.lat, lng: stop.geocodedWish.lng });
        mapRef.current.setZoom(14);
      }
    }
  };

  const getStopIndex = (wishId: number): number | undefined => {
    const stop = optimizedRoute.find(s => s.geocodedWish?.wish.id === wishId);
    return stop?.index;
  };

  const createNorthPoleIcon = (): string => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="48" height="48">
        <circle cx="20" cy="20" r="18" fill="#dc2626" stroke="#fff" stroke-width="2"/>
        <text x="20" y="26" text-anchor="middle" fill="#fff" font-size="20" font-family="Arial">🎅</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] bg-slate-100 rounded-xl flex items-center justify-center">
        <div className="text-slate-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={5}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {/* Air route polyline */}
          {showRoute && routePath.length > 1 && (
            <PolylineF
              path={routePath}
              options={{
                strokeColor: '#dc2626',
                strokeWeight: 3,
                strokeOpacity: 0.8,
                geodesic: true, // Draw great circle arcs (shortest path on globe)
                icons: [{
                  icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 3,
                    strokeColor: '#dc2626',
                    fillColor: '#dc2626',
                    fillOpacity: 1,
                  },
                  offset: '50%',
                  repeat: '200px',
                }],
              }}
            />
          )}

          {/* North Pole marker */}
          <MarkerF
            position={NORTH_POLE}
            icon={{
              url: createNorthPoleIcon(),
              scaledSize: new google.maps.Size(48, 48),
              anchor: new google.maps.Point(24, 24),
            }}
            zIndex={1001}
            title="North Pole - Santa's Workshop"
          />

          {geocodedWishes.map((gw) => {
            const stopIndex = getStopIndex(gw.wish.id);
            return (
              <MarkerF
                key={gw.wish.id}
                position={{ lat: gw.lat, lng: gw.lng }}
                icon={{
                  url: createMarkerIcon(statusColors[gw.wish.status], stopIndex?.toString()),
                  scaledSize: new google.maps.Size(36, 36),
                  anchor: new google.maps.Point(18, 36),
                }}
                onClick={() => handleMarkerClick(gw)}
                zIndex={selectedWish?.wish.id === gw.wish.id ? 1000 : stopIndex}
              />
            );
          })}

          {selectedWish && (
            <InfoWindowF
              position={{ lat: selectedWish.lat, lng: selectedWish.lng }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="p-2 max-w-[250px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                    Stop #{getStopIndex(selectedWish.wish.id)}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{selectedWish.wish.title}</h3>
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{selectedWish.wish.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: statusColors[selectedWish.wish.status] }}
                  />
                  <span className="text-xs font-medium text-slate-700">
                    {statusLabels[selectedWish.wish.status]}
                  </span>
                </div>
                {selectedWish.wish.name && (
                  <p className="text-xs text-slate-500">From: {selectedWish.wish.name}</p>
                )}
                <p className="text-xs text-slate-500">
                  {selectedWish.wish.street} {selectedWish.wish.house_number}, {selectedWish.wish.city}
                </p>
                {onWishClick && (
                  <button
                    onClick={() => onWishClick(selectedWish.wish)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details
                  </button>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>

        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRoute}
              onChange={(e) => setShowRoute(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <Route className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-slate-700">Show Route</span>
          </label>
        </div>

        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="text-xs font-semibold text-slate-700 mb-2">Legend</div>
          <div className="space-y-1">
            {(Object.keys(statusColors) as Status[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusColors[status] }}
                />
                <span className="text-xs text-slate-600">{statusLabels[status]}</span>
              </div>
            ))}
          </div>
        </div>

        {geocodedWishes.length === 0 && wishes.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 rounded-xl">
            <div className="text-slate-500 text-sm">No wishes with valid addresses to display</div>
          </div>
        )}
      </div>

      {optimizedRoute.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Santa&apos;s Delivery Route</h3>
                  <p className="text-red-100 text-sm">Optimized path for maximum efficiency</p>
                </div>
              </div>
              <div className="flex gap-6 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">{optimizedRoute.length}</div>
                  <div className="text-xs text-red-100">Stops</div>
                </div>
                {totalDistance && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalDistance}</div>
                    <div className="text-xs text-red-100">Air Distance</div>
                  </div>
                )}
                {totalDuration && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalDuration}</div>
                    <div className="text-xs text-red-100">Flight Time</div>
                  </div>
                )}
                {totalCO2 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold flex items-center gap-1">
                      <Leaf className="w-5 h-5" />
                      {totalCO2}
                    </div>
                    <div className="text-xs text-red-100">CO₂ Emissions</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CO2 Info Box */}
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-800">
                <p className="font-medium mb-1">How we calculate CO₂ emissions:</p>
                <p className="text-emerald-700">
                  Santa&apos;s sleigh is powered by 9 magical reindeer. While reindeer naturally produce methane (~0.5 kg CO₂/km each),
                  Christmas magic dust reduces emissions by 90%! Final rate: <strong>0.045 kg CO₂/km</strong> —
                  that&apos;s 82% cleaner than a commercial airplane (0.255 kg/km per passenger).
                </p>
              </div>
            </div>
          </div>

          {isCalculatingRoute ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
              <p className="text-slate-500">Calculating optimal route...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {optimizedRoute.map((stop, idx) => (
                <div
                  key={stop.isNorthPole ? 'north-pole' : stop.geocodedWish?.wish.id}
                  className={`flex items-center gap-4 p-4 transition ${
                    stop.isNorthPole
                      ? 'bg-gradient-to-r from-red-50 to-green-50'
                      : 'hover:bg-slate-50 cursor-pointer'
                  }`}
                  onClick={() => !stop.isNorthPole && stop.geocodedWish && scrollToStop(stop)}
                >
                  <div className="flex-shrink-0 relative">
                    {stop.isNorthPole ? (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-600 text-xl">
                        🎅
                      </div>
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: statusColors[stop.geocodedWish!.wish.status] }}
                      >
                        {stop.index}
                      </div>
                    )}
                    {idx < optimizedRoute.length - 1 && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-200" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {stop.isNorthPole ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">
                            North Pole - Santa&apos;s Workshop
                          </h4>
                          <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                            Starting Point
                          </span>
                        </div>
                        <div className="text-sm text-slate-500">
                          Ho ho ho! Time to deliver some wishes! 🎄
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 truncate">
                            {stop.geocodedWish!.wish.title}
                          </h4>
                          <span
                            className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${statusColors[stop.geocodedWish!.wish.status]}20`,
                              color: statusColors[stop.geocodedWish!.wish.status],
                            }}
                          >
                            {statusLabels[stop.geocodedWish!.wish.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5" />
                            <span className="truncate">{stop.geocodedWish!.wish.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">
                              {stop.geocodedWish!.wish.street} {stop.geocodedWish!.wish.house_number}, {stop.geocodedWish!.wish.city}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-right space-y-1">
                    {stop.duration && (
                      <div className="flex items-center justify-end gap-1 text-slate-500 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{stop.duration}</span>
                      </div>
                    )}
                    {stop.distance && (
                      <div className="text-xs text-slate-400">{stop.distance}</div>
                    )}
                    {stop.co2 && (
                      <div className="flex items-center justify-end gap-1 text-emerald-600 text-xs font-medium">
                        <Leaf className="w-3 h-3" />
                        <span>{stop.co2}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {stop.isNorthPole ? (
                      <div className="text-xl">🎁</div>
                    ) : (
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          stop.geocodedWish!.wish.status === 'granted'
                            ? 'text-emerald-500'
                            : 'text-slate-300'
                        }`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
