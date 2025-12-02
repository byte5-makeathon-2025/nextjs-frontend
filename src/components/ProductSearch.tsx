'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Package, X } from 'lucide-react';
import debounce from 'lodash/debounce';
import type { Product } from '@/types';

interface ProductSearchProps {
  onProductSelect: (product: Product | null) => void;
  selectedProduct: Product | null;
}

interface DummyJSONProduct {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  images: string[];
  weight: number; // in grams
  description?: string;
}

interface DummyJSONResponse {
  products: DummyJSONProduct[];
  total: number;
}

export function ProductSearch({ onProductSelect, selectedProduct }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(searchQuery)}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      const data: DummyJSONResponse = await response.json();

      // Map DummyJSON response to our Product type
      const mappedProducts: Product[] = data.products.map((p) => ({
        sku: p.id,
        name: p.title,
        salePrice: p.price,
        image: p.thumbnail,
        weight: p.weight ?? null, // DummyJSON weight is already in kg
        shortDescription: p.description,
      }));

      setResults(mappedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      searchProducts(value);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: Product) => {
    onProductSelect(product);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleClear = () => {
    onProductSelect(null);
  };

  if (selectedProduct) {
    return (
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex gap-4">
          {selectedProduct.image && (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-20 h-20 object-contain rounded bg-white"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-slate-900 line-clamp-2">{selectedProduct.name}</h4>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {selectedProduct.weight && (
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {selectedProduct.weight.toFixed(2)} kg
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search for a product..."
          className="w-full pl-10 pr-4 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showResults && (query || results.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-600">{error}</div>
          )}
          {!error && results.length === 0 && query && !loading && (
            <div className="p-3 text-sm text-slate-500">No products found</div>
          )}
          {results.map((product) => (
            <button
              key={product.sku}
              type="button"
              onClick={() => handleSelect(product)}
              className="w-full p-3 flex gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-contain rounded bg-white flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 line-clamp-2">{product.name}</div>
                {product.weight && (
                  <div className="mt-1 text-xs text-slate-500">
                    {product.weight.toFixed(2)} kg
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
