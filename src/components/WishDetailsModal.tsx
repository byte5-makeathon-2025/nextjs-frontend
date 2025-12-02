import { useState } from 'react';
import { X, Trash2, Save, User, Calendar, MapPin, Package, DollarSign } from 'lucide-react';
import type { Wish, Status, Priority } from '@/types';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';

interface WishDetailsModalProps {
  wish: Wish;
  onClose: () => void;
  onUpdate: (wish: Wish) => void;
  onDelete: (wishId: number) => void;
}

const priorityColors = {
  high: 'bg-rose-100 text-rose-900 border-rose-300',
  medium: 'bg-amber-100 text-amber-900 border-amber-300',
  low: 'bg-slate-100 text-slate-700 border-slate-300',
};

const statusColors = {
  pending: 'bg-amber-50 text-amber-900 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-900 border-blue-200',
  granted: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  denied: 'bg-slate-100 text-slate-900 border-slate-200',
};

export default function WishDetailsModal({
  wish,
  onClose,
  onUpdate,
  onDelete,
}: WishDetailsModalProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(wish.title);
  const [description, setDescription] = useState(wish.description);
  const [priority, setPriority] = useState<Priority>(wish.priority);
  const [status, setStatus] = useState<Status>(wish.status);
  const [street, setStreet] = useState(wish.street || '');
  const [houseNumber, setHouseNumber] = useState(wish.house_number || '');
  const [postalCode, setPostalCode] = useState(wish.postal_code || '');
  const [city, setCity] = useState(wish.city || '');
  const [country, setCountry] = useState(wish.country || '');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await api.wishes.update(wish.id, {
        title,
        description,
        priority,
        status,
        street,
        house_number: houseNumber,
        postal_code: postalCode,
        city,
        country,
      });
      onUpdate(updated);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update wish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await api.wishes.delete(wish.id);
      onDelete(wish.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete wish:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Wish Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {editing ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="granted">Granted</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Address
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Street"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="House Number"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal Code"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="col-span-2 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {wish.title}
                </h3>
                {wish.description && (
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {wish.description}
                  </p>
                )}
              </div>

              {wish.product_name && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Product Details</h4>
                  <div className="flex gap-4">
                    {wish.product_image && (
                      <img
                        src={wish.product_image}
                        alt={wish.product_name}
                        className="w-24 h-24 object-contain rounded-lg bg-white border border-slate-200"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 font-medium mb-2">{wish.product_name}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {wish.product_price && (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">${Number(wish.product_price).toFixed(2)}</span>
                          </div>
                        )}
                        {wish.product_weight && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Package className="w-4 h-4" />
                            <span>{Number(wish.product_weight).toFixed(2)} kg</span>
                          </div>
                        )}
                        {wish.product_sku && (
                          <div className="text-slate-500">
                            SKU: {wish.product_sku}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <div
                  className={`px-3 py-1.5 rounded border text-sm font-semibold uppercase tracking-wide ${
                    priorityColors[wish.priority]
                  }`}
                >
                  Priority: {wish.priority}
                </div>

                <div
                  className={`px-3 py-1.5 rounded border text-sm font-semibold ${
                    statusColors[wish.status]
                  }`}
                >
                  Status: {wish.status.replace('_', ' ')}
                </div>
              </div>

              {(wish.user || wish.name) && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Submitted by:</span>
                    <span>{wish.user?.name || wish.name}</span>
                  </div>
                  {wish.user?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Email:</span>
                      <span>{wish.user.email}</span>
                    </div>
                  )}
                </div>
              )}

              {wish.street && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Address:</span>
                  </div>
                  <div className="text-sm text-gray-700 ml-6">
                    {wish.street} {wish.house_number}<br />
                    {wish.postal_code} {wish.city}<br />
                    {wish.country}
                  </div>
                </div>
              )}

              {wish.created_at && (
                <div className="text-xs text-gray-500">
                  Created: {new Date(wish.created_at).toLocaleString()}
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-6 border-t border-slate-200">
            {editing ? (
              <>
                <IconButton
                  onClick={handleSave}
                  disabled={loading}
                  variant="primary"
                  icon={<Save className="w-4 h-4" />}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </IconButton>
                <Button
                  onClick={() => {
                    setEditing(false);
                    setTitle(wish.title);
                    setDescription(wish.description);
                    setPriority(wish.priority);
                    setStatus(wish.status);
                    setStreet(wish.street || '');
                    setHouseNumber(wish.house_number || '');
                    setPostalCode(wish.postal_code || '');
                    setCity(wish.city || '');
                    setCountry(wish.country || '');
                  }}
                  variant="secondary"
                  className="px-6"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setEditing(true)}
                  variant="primary"
                  className="flex-1"
                >
                  Edit Wish
                </Button>
                <IconButton
                  onClick={handleDelete}
                  disabled={loading}
                  variant={deleteConfirm ? 'danger' : 'secondary'}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="px-4"
                >
                  {deleteConfirm ? 'Confirm' : 'Delete'}
                </IconButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
