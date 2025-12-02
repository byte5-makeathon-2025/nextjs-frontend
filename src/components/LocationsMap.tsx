'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Priority } from '@/types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { WishLocation } from '@/app/dashboard/locations/page';

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length) {
      map.fitBounds(positions, { padding: [24, 24] });
    }
  }, [map, positions]);

  return null;
}

export default function LocationsMap({ wishes }: { wishes: WishLocation[] }) {
  const positions = useMemo(
    () => wishes.map((wish) => [wish.latitude, wish.longitude] as [number, number]),
    [wishes]
  );

  const priorityIcons = useMemo(() => {
    const createIcon = (color: string) =>
      L.divIcon({
        className: 'priority-marker',
        html: `<div style="
          background:${color};
          width:18px;
          height:18px;
          border-radius:9999px;
          border:2px solid white;
          box-shadow:0 2px 4px rgba(15,23,42,0.25);
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
      });

    return {
      high: createIcon('#ef4444'),
      medium: createIcon('#facc15'),
      low: createIcon('#22c55e'),
    } as Record<Priority, L.DivIcon>;
  }, []);

  return (
    <MapContainer
      className="h-[520px] w-full rounded-xl overflow-hidden"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {positions.length > 0 && <FitBounds positions={positions} />}
      {wishes.map((wish) => (
        <Marker
          key={wish.id}
          position={[wish.latitude, wish.longitude]}
          icon={priorityIcons[wish.priority ?? 'medium']}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold text-slate-900">{wish.title}</div>
              {(wish.name) && (
                <div className="text-sm text-slate-600">
                  Submitted by {wish.name}
                </div>
              )}
              <div className="text-xs text-slate-500">ID: {wish.id}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
