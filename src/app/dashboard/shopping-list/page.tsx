'use client';

import { useEffect, useState, Fragment } from 'react';
import { api } from '@/lib/api';
import type { ShoppingListItem, ShoppingListResponse } from '@/types';
import { ShoppingCart, Package, DollarSign, Scale, ChevronDown, ChevronUp, MapPin, Users } from 'lucide-react';

export default function ShoppingListPage() {
  const [data, setData] = useState<ShoppingListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const response = await api.wishes.getShoppingList();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shopping list');
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingList();
  }, []);

  const toggleExpanded = (sku: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) {
        next.delete(sku);
      } else {
        next.add(sku);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!data || data.shopping_list.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Shopping List Empty</h2>
        <p className="text-slate-500">No pending wishes with products yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Santa&apos;s Shopping List</h1>
          <p className="text-slate-500 mt-1">Products to procure for pending wishes</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{data.shopping_list.length}</div>
              <div className="text-sm text-slate-500">Unique Products</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{data.total_items}</div>
              <div className="text-sm text-slate-500">Total Items</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">${data.total_cost.toLocaleString()}</div>
              <div className="text-sm text-slate-500">Total Cost</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Scale className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{data.total_weight.toFixed(2)} kg</div>
              <div className="text-sm text-slate-500">Total Weight</div>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Unit Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Weight</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Wishes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.shopping_list.map((item: ShoppingListItem) => {
                const isExpanded = expandedItems.has(item.product_sku);
                return (
                  <Fragment key={item.product_sku}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-12 h-12 object-contain rounded bg-slate-100"
                            />
                          )}
                          <div>
                            <div className="font-medium text-slate-900 line-clamp-1">{item.product_name}</div>
                            <div className="text-xs text-slate-500">SKU: {item.product_sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 font-bold rounded-full">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-600">
                        ${item.product_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-900">
                        ${item.total_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right text-slate-600">
                        {item.total_weight.toFixed(2)} kg
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleExpanded(item.product_sku)}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <Users className="w-4 h-4" />
                          {item.wishes.length}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 px-6 py-4">
                          <div className="text-sm font-medium text-slate-700 mb-2">Related Wishes:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {item.wishes.map((wish) => (
                              <div
                                key={wish.id}
                                className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3"
                              >
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-semibold text-slate-600">
                                    {wish.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 truncate">{wish.name}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {wish.city}
                                  </div>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    wish.status === 'pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {wish.status.replace('_', ' ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
