'use client';

import React from 'react';
import { ActivitySummary } from '@/types';
import {
  X,
  MapPin,
  PlusCircle,
  Star,
  Clock,
  DollarSign,
  Compass,
  Navigation,
  Utensils,
  Footprints,
  Landmark,
  Palmtree,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ActivityDetailModalProps {
  activity: ActivitySummary | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToTrip?: (activity: ActivitySummary) => void;
}

export function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
  onAddToTrip,
}: ActivityDetailModalProps) {
  if (!isOpen || !activity) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Cover Photo Area */}
        <div className="relative h-60 sm:h-64 w-full bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={
              activity.imageUrl ||
              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
            }
            alt={activity.title}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm flex items-center gap-1.5 ${categoryStyle}`}
            >
              <CategoryIcon className="w-3.5 h-3.5" />
              {activity.category}
            </span>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Title & Location */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow-sm">
              {activity.title}
            </h2>
            {(activity.cityName || activity.countryName) && (
              <p className="text-xs text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {activity.cityName}
                  {activity.countryName ? `, ${activity.countryName}` : ''}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Duration
              </span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                <Clock className="w-4 h-4 text-sky-600" />
                {activity.durationMinutes >= 60
                  ? `${Math.floor(activity.durationMinutes / 60)}h ${
                      activity.durationMinutes % 60 ? `${activity.durationMinutes % 60}m` : ''
                    }`
                  : `${activity.durationMinutes} mins`}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Estimated Cost
              </span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {activity.estimatedCost > 0 ? formatCurrency(activity.estimatedCost) : 'Free Experience'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Traveler Rating
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{activity.rating ? activity.rating.toFixed(1) : '4.5'}</span>
                <span className="text-xs font-normal text-slate-400">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              About this Activity
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100">
              {activity.description}
            </p>
          </div>

          {/* Address & Navigation */}
          {activity.address && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Location & Address
              </h3>
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium">
                <Navigation className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>{activity.address}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close
          </button>

          {onAddToTrip ? (
            <button
              onClick={() => {
                onClose();
                onAddToTrip(activity);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              Schedule for Trip
            </button>
          ) : (
            <a
              href="/my-trips"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              Add to Trip
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
