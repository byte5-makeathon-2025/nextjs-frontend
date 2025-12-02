/**
 * Route optimization utilities for finding the shortest route covering all addresses
 */

import { getGeocodeAddress } from "./getGeocodeAddress";

export interface Address {
  id?: string | number;
  address: string;
  lat?: number;
  lng?: number;
  [key: string]: any; // Allow additional properties
}

export interface RouteResult {
  route: Address[];
  totalDistance: number;
  distanceMatrix: number[][];
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Build distance matrix from addresses
 * If coordinates are not provided, returns a placeholder matrix
 * (In production, you'd geocode addresses first)
 */
function buildDistanceMatrix(addresses: Address[]): number[][] {
  const n = addresses.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 0;
      } else if (
        addresses[i].lat !== undefined &&
        addresses[i].lng !== undefined &&
        addresses[j].lat !== undefined &&
        addresses[j].lng !== undefined
      ) {
        matrix[i][j] = calculateDistance(
          addresses[i].lat!,
          addresses[i].lng!,
          addresses[j].lat!,
          addresses[j].lng!
        );
      } else {
        // Placeholder: assume addresses without coordinates are far apart
        // In production, you'd geocode these addresses first
        matrix[i][j] = Infinity;
      }
    }
  }

  return matrix;
}

/**
 * Nearest Neighbor heuristic for TSP
 * Simple and fast, good for small to medium problem sizes
 */
function nearestNeighbor(
  addresses: Address[],
  distanceMatrix: number[][],
  startIndex: number = 0
): Address[] {
  const n = addresses.length;
  if (n <= 1) return [...addresses];

  const visited = new Set<number>([startIndex]);
  const route: Address[] = [addresses[startIndex]];

  let current = startIndex;

  while (visited.size < n) {
    let nearest = -1;
    let minDistance = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && distanceMatrix[current][i] < minDistance) {
        minDistance = distanceMatrix[current][i];
        nearest = i;
      }
    }

    if (nearest === -1) break; // No unvisited nodes found

    visited.add(nearest);
    route.push(addresses[nearest]);
    current = nearest;
  }

  return route;
}

/**
 * 2-opt improvement algorithm
 * Improves a route by swapping edges
 */
function twoOptImprovement(
  route: Address[],
  distanceMatrix: number[][],
  originalAddresses: Address[],
  maxIterations: number = 100
): Address[] {
  const n = route.length;
  if (n <= 3) return route;

  let improved = true;
  let iterations = 0;
  let bestRoute = [...route];
  let bestDistance = calculateRouteDistance(
    route,
    distanceMatrix,
    originalAddresses
  );

  while (improved && iterations < maxIterations) {
    improved = false;

    for (let i = 1; i < n - 2; i++) {
      for (let j = i + 1; j < n; j++) {
        if (j - i === 1) continue;

        // Try reversing segment between i and j
        const newRoute = [
          ...bestRoute.slice(0, i),
          ...bestRoute.slice(i, j + 1).reverse(),
          ...bestRoute.slice(j + 1),
        ];

        const newDistance = calculateRouteDistance(
          newRoute,
          distanceMatrix,
          originalAddresses
        );

        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }

    iterations++;
  }

  return bestRoute;
}

/**
 * Calculate total distance of a route
 */
function calculateRouteDistance(
  route: Address[],
  distanceMatrix: number[][],
  originalAddresses: Address[]
): number {
  if (route.length <= 1) return 0;

  let total = 0;
  const getIndex = (address: Address): number => {
    return originalAddresses.findIndex(
      (a) =>
        (a.id !== undefined &&
          address.id !== undefined &&
          a.id === address.id) ||
        a.address === address.address
    );
  };

  for (let i = 0; i < route.length - 1; i++) {
    const idx1 = getIndex(route[i]);
    const idx2 = getIndex(route[i + 1]);
    if (idx1 >= 0 && idx2 >= 0) {
      total += distanceMatrix[idx1]?.[idx2] || 0;
    }
  }

  return total;
}

/**
 * Find shortest route using multiple starting points and return the best
 */
function findBestRoute(
  addresses: Address[],
  distanceMatrix: number[][],
  useTwoOpt: boolean = true
): Address[] {
  if (addresses.length <= 1) return [...addresses];

  let bestRoute: Address[] = [];
  let bestDistance = Infinity;

  // Try starting from each address and pick the best result
  for (let start = 0; start < Math.min(addresses.length, 10); start++) {
    let route = nearestNeighbor(addresses, distanceMatrix, start);

    if (useTwoOpt && route.length > 3) {
      route = twoOptImprovement(route, distanceMatrix, addresses);
    }

    const distance = calculateRouteDistance(route, distanceMatrix, addresses);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestRoute = route;
    }
  }

  return bestRoute;
}

/**
 * Main function to find the shortest route covering all addresses
 *
 * @param addresses Array of addresses to visit
 * @param startAddress Optional starting address (if not provided, will try all)
 * @param useTwoOpt Whether to use 2-opt improvement (default: true)
 * @returns Optimized route and distance information
 */
export function findShortestRoute(
  addresses: Address[],
  startAddress?: Address,
  useTwoOpt: boolean = true
): RouteResult {
  if (addresses.length === 0) {
    return {
      route: [],
      totalDistance: 0,
      distanceMatrix: [],
    };
  }

  if (addresses.length === 1) {
    return {
      route: [...addresses],
      totalDistance: 0,
      distanceMatrix: [[0]],
    };
  }

  // Build distance matrix
  const distanceMatrix = buildDistanceMatrix(addresses);

  // Check if we have coordinates for all addresses
  const hasAllCoordinates = addresses.every(
    (addr) => addr.lat !== undefined && addr.lng !== undefined
  );

  if (!hasAllCoordinates) {
    console.warn(
      "Some addresses are missing coordinates. Distance calculations may be inaccurate. " +
        "Consider geocoding addresses first using a mapping service API."
    );
  }

  // Find optimal route
  let route: Address[];
  if (startAddress) {
    const startIndex = addresses.findIndex(
      (a) =>
        (a.id !== undefined &&
          startAddress.id !== undefined &&
          a.id === startAddress.id) ||
        a.address === startAddress.address
    );
    if (startIndex === -1) {
      throw new Error("Start address not found in addresses array");
    }
    route = nearestNeighbor(addresses, distanceMatrix, startIndex);
    if (useTwoOpt && route.length > 3) {
      route = twoOptImprovement(route, distanceMatrix, addresses);
    }
  } else {
    route = findBestRoute(addresses, distanceMatrix, useTwoOpt);
  }

  // Calculate total distance
  const totalDistance = calculateRouteDistance(
    route,
    distanceMatrix,
    addresses
  );

  return {
    route,
    totalDistance,
    distanceMatrix,
  };
}

/**
 * Geocode multiple addresses
 */
export async function geocodeAddresses(
  addresses: Address[]
): Promise<Address[]> {
  const geocoded = await Promise.all(
    addresses.map(async (addr) => {
      if (addr.lat !== undefined && addr.lng !== undefined) {
        return addr; // Already has coordinates
      }
      const coords = await getGeocodeAddress(addr.address);
      return coords ? { ...addr, lat: coords.lat, lng: coords.lng } : addr;
    })
  );
  return geocoded;
}
