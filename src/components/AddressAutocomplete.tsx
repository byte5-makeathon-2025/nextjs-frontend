'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import type { Address } from '@/types';

const libraries: ('places')[] = ['places'];

interface AddressAutocompleteProps {
  onAddressSelect: (address: Address) => void;
  initialValue?: string;
}

function parseAddressComponents(components: google.maps.GeocoderAddressComponent[]): Address {
  const address: Address = {
    street: '',
    house_number: '',
    postal_code: '',
    city: '',
    country: '',
  };

  for (const component of components) {
    const type = component.types[0];

    switch (type) {
      case 'street_number':
        address.house_number = component.long_name;
        break;
      case 'route':
        address.street = component.long_name;
        break;
      case 'locality':
        address.city = component.long_name;
        break;
      case 'postal_code':
        address.postal_code = component.long_name;
        break;
      case 'country':
        address.country = component.long_name;
        break;
      case 'sublocality_level_1':
        if (!address.city) {
          address.city = component.long_name;
        }
        break;
      case 'administrative_area_level_1':
        if (!address.city) {
          address.city = component.long_name;
        }
        break;
    }
  }

  return address;
}

export function AddressAutocomplete({ onAddressSelect, initialValue = '' }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(initialValue);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.address_components) return;

    const address = parseAddressComponents(place.address_components);
    setInputValue(place.formatted_address || '');
    onAddressSelect(address);
  }, [onAddressSelect]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['address_components', 'formatted_address'],
    });

    autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
  }, [isLoaded, handlePlaceChanged]);

  if (!isLoaded) {
    return (
      <div className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent text-slate-400 text-lg">
        Loading...
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Start typing your address..."
      className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900 text-lg"
    />
  );
}
