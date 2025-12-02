import { Map, MapMarker, MapTileLayer, MapPolyline } from "@/components/ui/map";
import type { LatLngExpression } from "leaflet";

export default function MapWithMarkers() {
  const CITIES = [
    {
      name: "Toronto",
      coordinates: [43.6532, -79.3832] satisfies LatLngExpression,
    },
    {
      name: "Port Elizabeth",
      coordinates: [-33.9137, 25.5827] satisfies LatLngExpression,
    },
    {
      name: "Hong Kong",
      coordinates: [22.3193, 114.1694] satisfies LatLngExpression,
    },
  ];

  const POINTS: LatLngExpression[] = CITIES.map((city) => city.coordinates);

  return (
    <Map center={CITIES[1].coordinates} zoom={1}>
      <MapTileLayer />
      {CITIES.map((city) => (
        <MapMarker key={city.name} position={city.coordinates} />
      ))}
      <MapPolyline positions={POINTS} fillColor="white" />
    </Map>
  );
}
