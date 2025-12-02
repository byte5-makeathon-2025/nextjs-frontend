import { Map, MapMarker, MapTileLayer, MapPolyline } from "@/components/ui/map";
import { icon, type LatLngExpression } from "leaflet";

export default function MapWithMarkers() {
  const CITIES = [
    {
      name: "Toronto",
      coordinates: [43.6532, -79.3832] satisfies LatLngExpression,
      number: 1,
    },
    {
      name: "Port Elizabeth",
      coordinates: [-33.9137, 25.5827] satisfies LatLngExpression,
      number: 2,
    },
    {
      name: "Hong Kong",
      coordinates: [22.3193, 114.1694] satisfies LatLngExpression,
      number: 3,
    },
  ];

  const POINTS: LatLngExpression[] = CITIES.map((city) => city.coordinates);

  return (
    <Map center={CITIES[1].coordinates} zoom={1}>
      <MapTileLayer />
      {CITIES.map((city) => (
        <MapMarker
          key={city.name}
          position={city.coordinates}
          icon={
            <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full border-2 border-white shadow-lg">
              <div className="flex flex-col items-center">
                <span className="text-lg leading-none">🎁</span>
                <span className="text-[10px] font-bold text-white leading-none">
                  {city.number}
                </span>
              </div>
            </div>
          }
        />
      ))}
      <MapPolyline positions={POINTS} fillColor="white" />
    </Map>
  );
}
