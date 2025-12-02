import {
	Map,
	MapMarker,
	MapTileLayer,
	MapPolyline,
	MapPopup,
} from "@/components/ui/map";
import { type LatLngExpression } from "leaflet";

export default function MapWithMarkers() {
	const CITIES = [
		{
			name: "Berlin",
			coordinates: [52.52, 13.405] satisfies LatLngExpression,
			number: 0,
		},
		{
			name: "Paris",
			coordinates: [48.8566, 2.3522] satisfies LatLngExpression,
			number: 1,
		},
		{
			name: "Frankfurt",
			coordinates: [50.1109, 8.6821] satisfies LatLngExpression,
			number: 2,
		},
		{
			name: "Rom",
			coordinates: [41.9028, 12.4964] satisfies LatLngExpression,
			number: 3,
		},
		{
			name: "Madrid",
			coordinates: [40.4168, -3.7038] satisfies LatLngExpression,
			number: 4,
		},
		{
			name: "London",
			coordinates: [51.5074, -0.1278] satisfies LatLngExpression,
			number: 5,
		},
		{
			name: "Mailand",
			coordinates: [45.4642, 9.19] satisfies LatLngExpression,
			number: 6,
		},
		{
			name: "Stockholm",
			coordinates: [59.3293, 18.0686] satisfies LatLngExpression,
			number: 7,
		},
		{
			name: "San Francisco",
			coordinates: [37.7749, -122.4194] satisfies LatLngExpression,
			number: 8,
		},
		{
			name: "Los Angeles",
			coordinates: [34.0522, -118.2437] satisfies LatLngExpression,
			number: 9,
		},
	];

	const POINTS: LatLngExpression[] = CITIES.map((city) => city.coordinates);

	return (
		<div className="relative p-4 h-full">
			<div
				className="absolute inset-2 rounded-xl"
				style={{
					background: `
            repeating-linear-gradient(
              45deg,
              #c41e3a,
              #c41e3a 10px,
              #f5f5f5 10px,
              #f5f5f5 20px,
              #228b22 20px,
              #228b22 30px,
              #f5f5f5 30px,
              #f5f5f5 40px
            )
          `,
				}}
			/>
			{/* <div className="absolute inset-[6px] rounded-lg bg-gradient-to-br from-[#1a472a] via-[#0d2818] to-[#1a472a]" /> */}
			{/* <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-2xl z-10">
				🎄
			</div>
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-2xl z-10">
				🎄
			</div>
			<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-xl">
				🎁
			</div>
			<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-xl">
				🎁
			</div>
			<div className="absolute top-2 left-2 text-lg z-50">❄️</div>
			<div className="absolute top-2 right-2 text-lg z-50">❄️</div>
			<div className="absolute bottom-2 left-2 text-lg z-50">⭐</div>
			<div className="absolute bottom-2 right-2 text-lg z-50">⭐</div>
			<div className="relative rounded-lg overflow-hidden shadow-[0_0_20px_rgba(196,30,58,0.4)]"> */}
			<Map
				center={CITIES[0].coordinates}
				zoom={3}
				zoomSnap={1}
				zoomDelta={1}
			>
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
					>
						<MapPopup className="w-56">{city.name}</MapPopup>
					</MapMarker>
				))}
				<MapPolyline
					positions={POINTS}
					fillColor="white"
				/>
			</Map>
		</div>
		//{" "}
		// </div>
	);
}
