'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CitySummary, CityWithActivities, ActivitySummary } from '@/types';
import { api } from '@/lib/api';
import {
  X,
  MapPin,
  Bookmark,
  PlusCircle,
  Star,
  DollarSign,
  Clock,
  Navigation,
  Compass,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CityDetailModalProps {
  city: CitySummary | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToTrip?: (city: CitySummary) => void;
  onAddActivityToTrip?: (activity: ActivitySummary) => void;
  onToggleSave?: (cityId: string) => void | Promise<void>;
  isSaved?: boolean;
}

const FALLBACK_MODAL_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

export function CityDetailModal({
  city,
  isOpen,
  onClose,
  onAddToTrip,
  onAddActivityToTrip,
  onToggleSave,
  isSaved = false,
}: CityDetailModalProps) {
  const [cityDetails, setCityDetails] = useState<CityWithActivities | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSaved, setLocalSaved] = useState(isSaved);
  const [imgSrc, setImgSrc] = useState(city?.imageUrl || FALLBACK_MODAL_IMAGE);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    setLocalSaved(isSaved);
  }, [isSaved]);

  useEffect(() => {
    if (city) {
      setImgSrc(city.imageUrl || FALLBACK_MODAL_IMAGE);
    }
  }, [city]);

  useEffect(() => {
    if (isOpen && city?.id) {
      const loadDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await api.getCity(city.id);
          setCityDetails(data);
        } catch (err: any) {
          console.error('Failed to load city details:', err);
          setError(err.message || 'Failed to load detailed city information');
        } finally {
          setLoading(false);
        }
      };
      loadDetails();
    } else {
      setCityDetails(null);
    }
  }, [isOpen, city?.id]);

  const handleBookmarkClick = async () => {
    if (!city || !onToggleSave) return;
    const previous = localSaved;
    setLocalSaved(!previous);
    try {
      await onToggleSave(city.id);
    } catch {
      setLocalSaved(previous);
    }
  };

  if (!isOpen || !city) return null;

  const getCostBadgeColor = (costIndex: string) => {
    switch (costIndex) {
      case 'BUDGET':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'LUXURY':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'MODERATE':
      default:
        return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FOOD':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ADVENTURE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CULTURE':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'RELAXATION':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'SHOPPING':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'NIGHTLIFE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SIGHTSEEING':
      default:
        return 'bg-sky-100 text-sky-800 border-sky-200';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-detail-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Cover Photo & Header */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={imgSrc}
            alt={city.name}
            className="w-full h-full object-cover opacity-90"
            onError={() => {
              if (imgSrc !== FALLBACK_MODAL_IMAGE) {
                setImgSrc(FALLBACK_MODAL_IMAGE);
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${getCostBadgeColor(
                city.costIndex
              )}`}
            >
              {city.costIndex} Tier
            </span>

            <div className="flex items-center gap-2">
              {onToggleSave && (
                <button
                  onClick={handleBookmarkClick}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                    localSaved
                      ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 scale-105'
                      : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
                  }`}
                  title={localSaved ? 'Saved in wishlist' : 'Save to wishlist'}
                  aria-label={localSaved ? 'Saved in wishlist' : 'Save to wishlist'}
                >
                  <Bookmark className={`w-4 h-4 ${localSaved ? 'fill-white' : ''}`} />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all"
                title="Close modal (Esc)"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Location Banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-1">
            <div className="flex items-center gap-2">
              <h2
                id="city-detail-modal-title"
                className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm flex items-center gap-2"
              >
                <MapPin className="w-6 h-6 text-sky-400 shrink-0" />
                <span>{city.name}</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-2 drop-shadow-sm">
              <span className="font-semibold">{city.country}</span>
              {city.region && <span>• {city.region}</span>}
              {city.latitude !== null && city.longitude !== null && (
                <span className="text-[11px] text-slate-300 flex items-center gap-1 hidden sm:inline-flex">
                  <Navigation className="w-3 h-3 text-sky-400" />
                  {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Avg Daily Cost
              </span>
              <span className="text-base font-extrabold text-slate-900 flex items-center gap-0.5">
                <DollarSign className="w-4 h-4 text-emerald-600 -mr-0.5" />
                {city.averageDailyCost !== undefined && city.averageDailyCost !== null
                  ? city.averageDailyCost
                  : 0}{' '}
                <span className="text-xs font-normal text-slate-500">/ day</span>
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Popularity Score
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-base">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{city.popularityScore ? city.popularityScore.toFixed(1) : '4.5'}</span>
                <span className="text-xs font-normal text-slate-400">/ 5.0</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Cost Category
              </span>
              <span className="text-sm font-bold text-slate-800">
                {city.costIndex === 'BUDGET'
                  ? 'Budget Friendly'
                  : city.costIndex === 'LUXURY'
                  ? 'Luxury & Premium'
                  : 'Moderate Standard'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              About Destination
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100">
              {city.description}
            </p>
          </div>

          {/* Top Activities Showcase */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Top Activities in {city.name}
              </h3>
              {cityDetails?.activities && (
                <span className="text-xs text-slate-500">
                  {cityDetails.activities.length} curated highlights
                </span>
              )}
            </div>

            {loading && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <RefreshCw className="w-6 h-6 text-sky-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Loading top activities for {city.name}...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!loading && cityDetails?.activities && cityDetails.activities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cityDetails.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {act.imageUrl ? (
                        <img
                          src={act.imageUrl}
                          alt={act.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                          <Compass className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getCategoryColor(
                              act.category
                            )}`}
                          >
                            {act.category}
                          </span>
                          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {act.rating.toFixed(1)}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 truncate" title={act.title}>
                          {act.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                          {act.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {act.durationMinutes}m
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">
                          {act.estimatedCost !== undefined && act.estimatedCost !== null
                            ? act.estimatedCost > 0
                              ? formatCurrency(act.estimatedCost)
                              : 'Free ($0)'
                            : 'Free ($0)'}
                        </span>
                      </div>

                      {onAddActivityToTrip && (
                        <button
                          onClick={() => onAddActivityToTrip(act)}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-[10px] transition-colors flex items-center gap-1"
                        >
                          <PlusCircle className="w-3 h-3" />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && (!cityDetails?.activities || cityDetails.activities.length === 0) && (
              <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-2xl">
                No curated activities found for this city yet.
              </p>
            )}
          </div>
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
                onAddToTrip(city);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              Add {city.name} to Trip
            </button>
          ) : (
            <a
              href={`/trips/create?destination=${encodeURIComponent(city.name)}`}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-sky-400" />
              Plan Trip to {city.name}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
