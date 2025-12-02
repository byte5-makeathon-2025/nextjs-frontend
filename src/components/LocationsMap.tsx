'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Wish } from '@/types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type LocationWish = {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  name?: string;
};

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length) {
      map.fitBounds(positions, { padding: [24, 24] });
    }
  }, [map, positions]);

  return null;
}

export default function LocationsMap({ wishes }: { wishes: LocationWish[] }) {
  const positions = useMemo(
    () => wishes.map((wish) => [wish.latitude, wish.longitude] as [number, number]),
    [wishes]
  );

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
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
        <Marker key={wish.id} position={[wish.latitude, wish.longitude]}>
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
