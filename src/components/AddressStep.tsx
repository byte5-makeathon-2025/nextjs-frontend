"use client";

import React, { useState, useEffect } from "react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface AddressStepProps {
  onSubmit: (addr: any) => void;
  onBack: () => void;
}

const AddressStep: React.FC<AddressStepProps> = ({ onSubmit, onBack }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [postal, setPostal] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    if (query.length < 3) return;

    const timeout = setTimeout(async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${query}`
      );
      const data = await res.json();
      setSuggestions(data);
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (s: Suggestion) => {
    setStreet(s.address.road ?? "");
    setHouse(s.address.house_number ?? "");
    setPostal(s.address.postcode ?? "");
    setCity(s.address.city ?? "");
    setState(s.address.state ?? "");
    setCountry(s.address.country ?? "");
    setLat(s.lat);
    setLng(s.lon);
    setSuggestions([]);
    setQuery(s.display_name);
  };

  const handleSubmit = () => {
    onSubmit({ street, house, postal, city, state, country, lat, lng });
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Search */}
      <div>
        <label className="text-sm text-slate-600">Search Address</label>
        <input
          type="text"
          value={query}
          placeholder="Type your address…"
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-0 py-2 border-b border-slate-300 bg-transparent outline-none text-black"
        />
        {suggestions.length > 0 && (
          <ul className="bg-white shadow-md border mt-2 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="p-2 hover:bg-slate-100 cursor-pointer text-black"
                onClick={() => handleSelect(s)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Manual Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-600">Street</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full border-b px-0 py-2 outline-none text-black"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">House No.</label>
          <input
            type="text"
            value={house}
            onChange={(e) => setHouse(e.target.value)}
            className="w-full border-b px-0 py-2 outline-none text-black"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-slate-600">Postal Code</label>
          <input
            type="text"
            value={postal}
            onChange={(e) => setPostal(e.target.value)}
            className="w-full border-b px-0 py-2 outline-none text-black"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border-b px-0 py-2 outline-none text-black"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full border-b px-0 py-2 outline-none text-black"
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-600">Country</label>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border-b px-0 py-2 outline-none text-black"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-600">Latitude</label>
          <input
            type="text"
            value={lat}
            disabled
            className="w-full border-b px-0 py-2 bg-slate-50 text-black"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Longitude</label>
          <input
            type="text"
            value={lng}
            disabled
            className="w-full border-b px-0 py-2 bg-slate-50 text-black"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-slate-300 text-slate-800 py-3 rounded"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-black text-white py-3 rounded"
        >
          Submit Wish 🎁
        </button>
      </div>{" "}
    </div>
  );
};

export default AddressStep;
