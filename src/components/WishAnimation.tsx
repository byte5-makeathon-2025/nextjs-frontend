'use client';

import { useEffect, useState } from 'react';
import type { Address, Product } from '@/types';

interface WishAnimationProps {
  name: string;
  address: Address | null;
  product: Product | null;
}

export function WishAnimation({ name, address, product }: WishAnimationProps) {
  const [gifUrl, setGifUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (name && address && product) {
      fetchGif();
    } else {
      setGifUrl('');
    }
  }, [name, address, product]);

  const fetchGif = async () => {
    if (!name || !address || !product) return;

    setIsLoading(true);

    try {
      // Extract keywords from product name for better matching
      const productName = product.name.toLowerCase();
      const location = address.city || address.country || '';

      // Create multiple search strategies for better variety and personalization
      const searchQueries = [
        `${productName} playing happy kid`,
        `${productName} child joy`,
        `${productName} excited kid`,
        `happy ${productName} celebration`,
        `kid with ${productName}`
      ];

      // Try multiple queries to get better variety
      let allResults: any[] = [];

      // Use Tenor API (Google's GIF platform) - has much larger variety than Giphy
      const apiKey = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ'; // Public demo key

      for (const query of searchQueries) {
        try {
          const response = await fetch(
            `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${apiKey}&client_key=wish_app&limit=20&contentfilter=high&media_filter=gif`
          );

          const data = await response.json();

          if (data.results && data.results.length > 0) {
            allResults = [...allResults, ...data.results];
          }
        } catch (err) {
          console.log('Query failed, trying next:', query);
        }
      }

      // Remove duplicates and pick a random one
      const uniqueResults = Array.from(new Set(allResults.map(r => r.id)))
        .map(id => allResults.find(r => r.id === id))
        .filter(Boolean);

      if (uniqueResults.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(uniqueResults.length, 30));
        const gifData = uniqueResults[randomIndex];
        setGifUrl(gifData.media_formats.gif.url);
      } else {
        // Fallback to generic Christmas wish animations
        const fallbackResponse = await fetch(
          `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent('christmas wish child happy present')}&key=${apiKey}&client_key=wish_app&limit=20&contentfilter=high&media_filter=gif`
        );
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.results && fallbackData.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * fallbackData.results.length);
          setGifUrl(fallbackData.results[randomIndex].media_formats.gif.url);
        }
      }
    } catch (error) {
      console.error('Failed to fetch GIF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!name && !address && !product) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-12 flex items-center justify-center border-r border-slate-200 relative">
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="text-center relative z-10">
          <div className="text-6xl mb-4 animate-pulse">✦</div>
          <h1 className="text-2xl text-slate-700 font-light">
            My Wish
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Fill in your details to see your wish come to life
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-12 flex items-center justify-center border-r border-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/40"></div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin text-6xl mb-4">✦</div>
            <p className="text-slate-600">Finding the perfect animation...</p>
          </div>
        </div>
      )}

      {gifUrl && (
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="relative w-full h-full max-w-md max-h-[500px] animate-fadeIn">
            <img
              src={gifUrl}
              alt={`${name}'s wish visualization`}
              className="w-full h-full object-cover rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-lg"></div>

            {name && (
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm font-medium bg-slate-900/60 backdrop-blur-sm px-3 py-2 rounded">
                  {name}&apos;s Wish
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
}
