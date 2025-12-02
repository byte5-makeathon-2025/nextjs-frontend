import { Map, MapMarker, MapTileLayer, MapPolyline } from "@/components/ui/map";
import { icon, type LatLngExpression } from "leaflet";

export default function MapWithMarkers() {
  const CITIES = [
    {
      name: "Toronto",
      coordinates: [43.6532, -79.3832] satisfies LatLngExpression,
      icon: <span className="text-sm">🎅1</span>,
    },
    {
      name: "Port Elizabeth",
      coordinates: [-33.9137, 25.5827] satisfies LatLngExpression,
      icon: <span className="text-sm">🎅2</span>,
    },
    {
      name: "Hong Kong",
      coordinates: [22.3193, 114.1694] satisfies LatLngExpression,
      icon: <span className="text-sm">🎅3</span>,
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
          icon={city.icon}
        />
      ))}
      <MapPolyline positions={POINTS} fillColor="white" />
    </Map>
  );
}
