'use client';

import React from 'react';
import { CitySummary } from '@/types';
import { Bookmark, MapPin, PlusCircle, Star, Info, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CityCardProps {
  city: CitySummary;
  onViewDetails?: (city: CitySummary) => void;
  onAddToTrip?: (city: CitySummary) => void;
  onToggleSave?: (cityId: string) => void;
  isSaved?: boolean;
}

export function CityCard({
  city,
  onViewDetails,
  onAddToTrip,
  onToggleSave,
  isSaved = false,
}: CityCardProps) {
  const getCostBadgeColor = (costIndex: string) => {
    switch (costIndex) {
      case 'BUDGET':
        return 'bg-emerald-500/90 text-white border-emerald-400/40';
      case 'LUXURY':
        return 'bg-purple-600/90 text-white border-purple-400/40';
      case 'MODERATE':
      default:
        return 'bg-sky-600/90 text-white border-sky-400/40';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
      {/* Header Image Area */}
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        <img
          src={
            city.imageUrl ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
          }
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Cost Index Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm ${getCostBadgeColor(
              city.costIndex
            )}`}
          >
            {city.costIndex}
          </span>
        </div>

        {/* Wishlist / Bookmark Toggle */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(city.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all ${
              isSaved
                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20 scale-105'
                : 'bg-black/40 text-white border-white/20 hover:bg-black/60 hover:scale-105'
            }`}
            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* City & Country Overlay Info */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-bold text-lg leading-snug drop-shadow-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">{city.name}</span>
          </h3>
          <p className="text-xs text-slate-200 flex items-center gap-1.5 drop-shadow-sm">
            <span>{city.country}</span>
            {city.region && <span>• {city.region}</span>}
          </p>
        </div>
      </div>

      {/* Body Content Area */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {city.description}
        </p>

        {/* Metrics Row */}
        <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Avg Daily Cost
            </span>
            <span className="font-extrabold text-slate-900 flex items-center gap-0.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 -mr-0.5" />
              {city.averageDailyCost} <span className="text-[11px] font-normal text-slate-500">/ day</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Popularity
            </span>
            <div className="flex items-center justify-end gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{city.popularityScore ? city.popularityScore.toFixed(1) : '4.5'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(city)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Details
            </button>
          )}

          {onAddToTrip ? (
            <button
              onClick={() => onAddToTrip(city)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              Add to Trip
            </button>
          ) : (
            <a
              href={`/trips/create?destination=${encodeURIComponent(city.name)}`}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              Plan Trip
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
