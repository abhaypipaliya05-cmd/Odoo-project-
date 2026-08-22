'use client';

import React, { useState, useEffect } from 'react';
import { ActivitySummary } from '@/types';
import {
  Clock,
  DollarSign,
  Star,
  MapPin,
  PlusCircle,
  Info,
  Trash2,
  Utensils,
  Compass,
  Footprints,
  Landmark,
  Palmtree,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ActivityCardProps {
  activity: ActivitySummary;
  onViewDetails?: (activity: ActivitySummary) => void;
  onAddToTrip?: (activity: ActivitySummary) => void;
  onRemoveFromTrip?: (activityId: string) => void;
  isScheduled?: boolean;
}

const FALLBACK_ACTIVITY_IMAGE =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';

export function ActivityCard({
  activity,
  onViewDetails,
  onAddToTrip,
  onRemoveFromTrip,
  isScheduled = false,
}: ActivityCardProps) {
  const [imgSrc, setImgSrc] = useState(activity.imageUrl || FALLBACK_ACTIVITY_IMAGE);

  useEffect(() => {
    setImgSrc(activity.imageUrl || FALLBACK_ACTIVITY_IMAGE);
  }, [activity.imageUrl]);

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'FOOD':
        return {
          icon: Utensils,
          style: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'ADVENTURE':
        return {
          icon: Footprints,
          style: 'bg-orange-100 text-orange-800 border-orange-300',
        };
      case 'CULTURE':
        return {
          icon: Landmark,
          style: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        };
      case 'RELAXATION':
        return {
          icon: Palmtree,
          style: 'bg-teal-100 text-teal-800 border-teal-300',
        };
      case 'SHOPPING':
        return {
          icon: ShoppingBag,
          style: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'NIGHTLIFE':
        return {
          icon: Sparkles,
          style: 'bg-purple-100 text-purple-800 border-purple-300',
        };
      case 'SIGHTSEEING':
      default:
        return {
          icon: Compass,
          style: 'bg-sky-100 text-sky-800 border-sky-300',
        };
    }
  };

  const { icon: CategoryIcon, style: categoryStyle } = getCategoryTheme(activity.category);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">
      {/* Header Image Area */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => {
            if (imgSrc !== FALLBACK_ACTIVITY_IMAGE) {
              setImgSrc(FALLBACK_ACTIVITY_IMAGE);
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm flex items-center gap-1 ${categoryStyle}`}
          >
            <CategoryIcon className="w-3 h-3" />
            {activity.category}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{activity.rating ? activity.rating.toFixed(1) : '4.5'}</span>
        </div>

        {/* City & Country Location Badge */}
        {(activity.cityName || activity.countryName) && (
          <div className="absolute bottom-3 left-3 right-3 text-white flex items-center gap-1.5 text-xs font-semibold drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">
              {activity.cityName}
              {activity.countryName ? `, ${activity.countryName}` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div className="space-y-1.5">
          <h3
            className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-sky-600 transition-colors"
            title={activity.title}
          >
            {activity.title}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        </div>

        {/* Activity Details: Duration & Estimated Cost */}
        <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {activity.durationMinutes >= 60
                ? `${Math.floor(activity.durationMinutes / 60)}h ${
                    activity.durationMinutes % 60 ? `${activity.durationMinutes % 60}m` : ''
                  }`
                : `${activity.durationMinutes} mins`}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Estimated Cost
            </span>
            <span className="font-extrabold text-slate-900">
              {activity.estimatedCost !== undefined && activity.estimatedCost !== null
                ? activity.estimatedCost > 0
                  ? formatCurrency(activity.estimatedCost)
                  : 'Free ($0)'
                : 'Free ($0)'}
            </span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(activity)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Quick View
            </button>
          )}

          {isScheduled && onRemoveFromTrip ? (
            <button
              onClick={() => onRemoveFromTrip(activity.id)}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          ) : onAddToTrip ? (
            <button
              onClick={() => onAddToTrip(activity)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              Add to Trip
            </button>
          ) : (
            <a
              href="/my-trips"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              Add to Trip
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
