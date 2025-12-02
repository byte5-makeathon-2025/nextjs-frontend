/**
 * Example usage of the route optimizer
 * 
 * This file demonstrates how to use the route optimization utilities
 * to find the shortest route covering all addresses.
 */

import { findShortestRoute, geocodeAddresses, type Address } from './routeOptimizer';

// Example 1: Using addresses with coordinates
export async function exampleWithCoordinates() {
  const addresses: Address[] = [
    {
      id: 1,
      address: 'Berlin, Germany',
      lat: 52.52,
      lng: 13.405,
    },
    {
      id: 2,
      address: 'Hamburg, Germany',
      lat: 53.5511,
      lng: 9.9937,
    },
    {
      id: 3,
      address: 'Munich, Germany',
      lat: 48.1351,
      lng: 11.582,
    },
    {
      id: 4,
      address: 'Cologne, Germany',
      lat: 50.9375,
      lng: 6.9603,
    },
  ];

  const result = findShortestRoute(addresses);
  
  console.log('Optimized route:');
  result.route.forEach((addr, index) => {
    console.log(`${index + 1}. ${addr.address}`);
  });
  console.log(`Total distance: ${result.totalDistance.toFixed(2)} km`);
  
  return result;
}

// Example 2: Using addresses without coordinates (requires geocoding)
export async function exampleWithoutCoordinates() {
  const addresses: Address[] = [
    { id: 1, address: '1600 Amphitheatre Parkway, Mountain View, CA' },
    { id: 2, address: '1 Infinite Loop, Cupertino, CA' },
    { id: 3, address: '350 5th Ave, New York, NY' },
  ];

  // First, geocode the addresses to get coordinates
  // Note: You'll need to implement the geocodeAddress function
  // or use a geocoding service API
  const geocodedAddresses = await geocodeAddresses(addresses);
  
  // Then find the shortest route
  const result = findShortestRoute(geocodedAddresses);
  
  return result;
}

// Example 3: With a specific starting address
export async function exampleWithStartAddress() {
  const addresses: Address[] = [
    { id: 1, address: 'Berlin, Germany', lat: 52.52, lng: 13.405 },
    { id: 2, address: 'Hamburg, Germany', lat: 53.5511, lng: 9.9937 },
    { id: 3, address: 'Munich, Germany', lat: 48.1351, lng: 11.582 },
  ];

  const startAddress = addresses[0]; // Start from Berlin
  const result = findShortestRoute(addresses, startAddress);
  
  return result;
}

// Example 4: Integration with wish addresses (if wishes have addresses)
export async function optimizeWishDeliveryRoute(wishes: any[]) {
  // Extract addresses from wishes
  const addresses: Address[] = wishes
    .filter((wish) => wish.address || (wish.lat && wish.lng))
    .map((wish) => ({
      id: wish.id,
      address: wish.address || `${wish.lat}, ${wish.lng}`,
      lat: wish.lat,
      lng: wish.lng,
    }));

  if (addresses.length === 0) {
    console.warn('No addresses found in wishes');
    return null;
  }

  // Geocode if needed
  const geocodedAddresses = await geocodeAddresses(addresses);
  
  // Find optimal route
  const result = findShortestRoute(geocodedAddresses);
  
  return result;
}

