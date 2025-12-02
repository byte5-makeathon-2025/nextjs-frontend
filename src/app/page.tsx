'use client';

import { FormEvent, useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { CheckCircle, Leaf, Plane, Package, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { ProductSearch } from '@/components/ProductSearch';
import { WishAnimation } from '@/components/WishAnimation';
import { calculateAirDistance, formatCO2, NORTH_POLE, SLEIGH_CO2_PER_KM, CARGO_CO2_PER_KG_KM } from '@/components/WishesMap';
import type { Address, Product } from '@/types';

export default function Home() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState<Address | null>(null);
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [co2Info, setCo2Info] = useState<{ distance: number; baseCo2: number; cargoCo2: number; totalCo2: number } | null>(null);
  const [title, setTitle] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [submitted, setSubmitted] = useState(false);
  const [submittedWishId, setSubmittedWishId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddressSelect = useCallback((selectedAddress: Address) => {
    setAddress(selectedAddress);
    // Geocode the address to get coordinates
    if (typeof google !== 'undefined') {
      const geocoder = new google.maps.Geocoder();
      const addressString = `${selectedAddress.street} ${selectedAddress.house_number}, ${selectedAddress.postal_code} ${selectedAddress.city}, ${selectedAddress.country}`;
      geocoder.geocode({ address: addressString }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const coords = { lat: location.lat(), lng: location.lng() };
          setAddressCoords(coords);
        }
      });
    }
  }, []);

  // Calculate CO2 when coordinates and product are available
  useEffect(() => {
    if (addressCoords) {
      const distance = calculateAirDistance(NORTH_POLE.lat, NORTH_POLE.lng, addressCoords.lat, addressCoords.lng);
      const weightKg = selectedProduct?.weight ?? 0;
      const baseCo2 = distance * SLEIGH_CO2_PER_KM;
      const cargoCo2 = weightKg * distance * CARGO_CO2_PER_KG_KM;
      const totalCo2 = baseCo2 + cargoCo2;
      setCo2Info({ distance, baseCo2, cargoCo2, totalCo2 });
    } else {
      setCo2Info(null);
    }
  }, [addressCoords, selectedProduct]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!address || !selectedProduct) {
      return;
    }

    setLoading(true);

    try {
      const createdWish = await api.wishes.create({
        name,
        street: address.street,
        house_number: address.house_number,
        postal_code: address.postal_code,
        city: address.city,
        country: address.country,
        title,
        priority,
        product_name: selectedProduct.name,
        product_sku: selectedProduct.sku.toString(),
        product_image: selectedProduct.image,
        product_weight: selectedProduct.weight ?? undefined,
        product_price: selectedProduct.salePrice,
      });
      setSubmittedWishId(createdWish.id);
      setSubmitted(true);
      setName('');
      setAddress(null);
      setAddressCoords(null);
      setCo2Info(null);
      setTitle('');
      setSelectedProduct(null);
      setPriority('medium');
    } catch (error) {
      console.error('Failed to submit wish:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
      <Link
        href="/login"
        className="absolute top-4 right-4 text-xs text-slate-400 hover:text-slate-600 transition-colors underline"
      >
        staff
      </Link>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-xl min-h-[600px]">
          <WishAnimation name={name} address={address} product={selectedProduct} />

          {/* Right side - form content */}
          <div className="p-12 flex flex-col justify-center">
            {submitted ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl text-slate-900 mb-2 font-light">
                  Thank you!
                </h2>
                <p className="text-slate-600 mb-6">
                  Your wish has been received.
                </p>

                {submittedWishId && (
                  <div className="bg-slate-50 rounded-lg p-4 text-left">
                    <p className="text-sm text-slate-600 mb-3">
                      Save this link to track your wish status:
                    </p>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/track/${submittedWishId}`}
                        className="flex-1 text-sm text-emerald-600 hover:text-emerald-700 underline truncate"
                      >
                        {typeof window !== 'undefined' ? `${window.location.origin}/track/${submittedWishId}` : `/track/${submittedWishId}`}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/track/${submittedWishId}`;
                          navigator.clipboard.writeText(url);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Copy link"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedWishId(null);
                    setCopied(false);
                  }}
                  className="mt-6 text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Make another wish
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-slate-600 mb-2">
                    Your name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900 text-lg"
                    placeholder="..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    Your address
                  </label>
                  <AddressAutocomplete onAddressSelect={handleAddressSelect} />
                  {address && (
                    <div className="mt-2 text-sm text-slate-500">
                      {address.street} {address.house_number}, {address.postal_code} {address.city}, {address.country}
                    </div>
                  )}
                  {co2Info && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                        <Leaf className="w-4 h-4" />
                        <span>Santa&apos;s Flight Impact</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500">Distance from North Pole</div>
                          <div className="text-slate-900 font-semibold">{Math.round(co2Info.distance).toLocaleString()} km</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Total CO₂ Emissions</div>
                          <div className="text-emerald-600 font-semibold">{formatCO2(co2Info.totalCo2)}</div>
                        </div>
                      </div>
                      {selectedProduct?.weight && (
                        <div className="mt-3 pt-3 border-t border-emerald-100 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-slate-500 flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              Base Sleigh Emissions
                            </div>
                            <div className="text-slate-700">{formatCO2(co2Info.baseCo2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              Cargo Weight ({selectedProduct.weight.toFixed(2)} kg)
                            </div>
                            <div className="text-slate-700">+{formatCO2(co2Info.cargoCo2)}</div>
                          </div>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-emerald-100 text-xs text-slate-500 flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        <span>
                          Equivalent plane trip would emit {formatCO2(co2Info.distance * 0.255)} — Santa&apos;s sleigh saves {Math.round((1 - co2Info.totalCo2 / (co2Info.distance * 0.255)) * 100)}% CO₂!
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm text-slate-600 mb-2">
                    I wish for
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900 text-lg"
                    placeholder="..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    Select a product
                  </label>
                  <ProductSearch
                    onProductSelect={setSelectedProduct}
                    selectedProduct={selectedProduct}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-3">
                    Priority
                  </label>
                  <div className="flex gap-4">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          checked={priority === p}
                          onChange={() => setPriority(p)}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-700 capitalize text-sm">
                          {p}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !address || !selectedProduct}
                    fullWidth
                    variant="primary"
                    className="py-3"
                  >
                    {loading ? 'Sending...' : 'Submit Wish'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
