import type { Wish, Status } from '@/types';
import { ChevronDown, MapPin, Package } from 'lucide-react';
import { useState, MouseEvent } from 'react';

interface WishCardProps {
  wish: Wish;
  onStatusChange: (wishId: number, status: Status) => void;
  onClick: () => void;
  onDragStart: (wish: Wish) => void;
  onDragEnd: () => void;
}

const priorityColors = {
  high: 'bg-rose-100 text-rose-900 border-rose-300',
  medium: 'bg-amber-100 text-amber-900 border-amber-300',
  low: 'bg-slate-100 text-slate-700 border-slate-300',
};

const statusOptions: { value: Status; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'granted', label: 'Granted' },
  { value: 'denied', label: 'Denied' },
];

export default function WishCard({ wish, onStatusChange, onClick, onDragStart, onDragEnd }: WishCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleStatusClick = (e: MouseEvent, newStatus: Status) => {
    e.stopPropagation();
    onStatusChange(wish.id, newStatus);
    setShowStatusMenu(false);
  };

  return (
    <div
      className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition cursor-move relative"
      onClick={onClick}
      draggable
      onDragStart={(e) => {
        onDragStart(wish);
        e.currentTarget.style.opacity = '0.5';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
        onDragEnd();
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-slate-900 line-clamp-2 flex-1 text-sm">
          {wish.title}
        </h3>
        <span
          className={`text-xs px-2 py-0.5 rounded border ml-2 font-medium uppercase tracking-wide ${
            priorityColors[wish.priority]
          }`}
        >
          {wish.priority}
        </span>
      </div>

      {wish.product_name && (
        <div className="flex gap-2 mb-3">
          {wish.product_image && (
            <img
              src={wish.product_image}
              alt={wish.product_name}
              className="w-12 h-12 object-contain rounded bg-slate-50 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-600 line-clamp-2">{wish.product_name}</p>
            {wish.product_weight && (
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Package className="w-3 h-3" />
                <span>{Number(wish.product_weight).toFixed(2)} kg</span>
              </div>
            )}
          </div>
        </div>
      )}

      {wish.description && (
        <p className="text-sm text-slate-600 line-clamp-3 mb-3">
          {wish.description}
        </p>
      )}

      {(wish.user || wish.name) && (
        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-semibold text-slate-600">
              {(wish.user?.name || wish.name || '').charAt(0).toUpperCase()}
            </span>
          </div>
          {wish.user?.name || wish.name}
        </div>
      )}

      {wish.city && (
        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {wish.city}{wish.country ? `, ${wish.country}` : ''}
        </div>
      )}

      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
        >
          Change status
          <ChevronDown className="w-3 h-3" />
        </button>

        {showStatusMenu && (
          <div className="absolute bottom-full left-0 mb-1 bg-white border border-slate-200 rounded-lg shadow-xl z-10 min-w-[150px] overflow-hidden">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={(e) => handleStatusClick(e, option.value)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
