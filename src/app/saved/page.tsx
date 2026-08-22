'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CitySummary } from '@/types';
import {
  Bookmark,
  PlusCircle,
  Star,
  RefreshCw,
  AlertCircle,
  Compass,
} from 'lucide-react';

export default function SavedDestinationsPage() {
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSavedDestinations();
      setCities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved destinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await api.removeSavedDestination(id);
      setCities((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bookmark className="w-7 h-7 text-indigo-600 fill-indigo-100" />
              Saved Bucket List
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your bookmarked travel destinations and future trip inspirations.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            <Compass className="w-4 h-4" />
            Discover More Places
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading your saved destinations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Sign in to view saved destinations</h3>
              <p className="text-xs text-rose-600 mt-1">Bookmarked cities are linked to your user account.</p>
              <Link
                href="/login"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold"
              >
                Log In
              </Link>
            </div>
          </div>
        )}

        {/* Grid Content */}
        {!loading && !error && (
          <>
            {cities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={city.imageUrl}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <button
                        onClick={() => handleRemove(city.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-rose-500 transition-colors"
                        title="Remove from saved"
                      >
                        <Bookmark className="w-4 h-4 fill-rose-500" />
                      </button>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-bold text-lg">{city.name}</h3>
                        <p className="text-xs text-slate-200">{city.country} {city.region ? `• ${city.region}` : ''}</p>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {city.description}
                      </p>

                      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Daily Cost</span>
                          <span className="font-bold text-slate-900">${city.averageDailyCost} / day</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{city.popularityScore}</span>
                        </div>
                      </div>

                      <Link
                        href={`/trips/create?destination=${encodeURIComponent(city.name)}`}
                        className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Plan Trip to {city.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                  <Bookmark className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Your wishlist is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Explore global destinations and click the bookmark icon to save places for your future travel plans.
                  </p>
                </div>
                <div>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition-all"
                  >
                    <Compass className="w-4 h-4" />
                    Browse Destinations
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
