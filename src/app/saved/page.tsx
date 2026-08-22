'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CitySummary, ActivitySummary } from '@/types';
import { CityCard } from '@/components/discovery/CityCard';
import { CityDetailModal } from '@/components/discovery/CityDetailModal';
import { AddCityToTripModal } from '@/components/discovery/AddCityToTripModal';
import { AddActivityToTripModal } from '@/components/discovery/AddActivityToTripModal';
import {
  Bookmark,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Compass,
  Sparkles,
} from 'lucide-react';

export default function SavedDestinationsPage() {
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [selectedCityForDetail, setSelectedCityForDetail] = useState<CitySummary | null>(null);
  const [selectedCityForTrip, setSelectedCityForTrip] = useState<CitySummary | null>(null);
  const [selectedActivityForTrip, setSelectedActivityForTrip] = useState<ActivitySummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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

  const handleRemove = async (cityId: string) => {
    try {
      await api.removeSavedDestination(cityId);
      setCities((prev) => prev.filter((d) => d.id !== cityId));
      showToast('Destination removed from wishlist');
    } catch (err: any) {
      console.error('Failed to remove:', err);
      showToast(err.message || 'Failed to remove from saved');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bookmark className="w-7 h-7 text-indigo-600 fill-indigo-100" />
              Saved Wishlist & Bucket List
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your bookmarked travel destinations ({cities.length} saved). Plan trips and schedule activities directly.
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
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading your saved destinations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-rose-800 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Sign in to view saved destinations</h3>
              <p className="text-xs text-rose-600 mt-1">Bookmarked cities are linked to your user account.</p>
              <Link
                href="/login"
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-semibold shadow-sm"
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
                  <CityCard
                    key={city.id}
                    city={city}
                    isSaved={true}
                    onToggleSave={handleRemove}
                    onViewDetails={(c) => setSelectedCityForDetail(c)}
                    onAddToTrip={(c) => setSelectedCityForTrip(c)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4 max-w-lg mx-auto shadow-sm">
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

      {/* Modals */}
      <CityDetailModal
        city={selectedCityForDetail}
        isOpen={Boolean(selectedCityForDetail)}
        onClose={() => setSelectedCityForDetail(null)}
        isSaved={true}
        onToggleSave={handleRemove}
        onAddToTrip={(c) => {
          setSelectedCityForDetail(null);
          setSelectedCityForTrip(c);
        }}
        onAddActivityToTrip={(act) => {
          setSelectedCityForDetail(null);
          setSelectedActivityForTrip(act);
        }}
      />

      <AddCityToTripModal
        city={selectedCityForTrip}
        isOpen={Boolean(selectedCityForTrip)}
        onClose={() => setSelectedCityForTrip(null)}
        onSuccess={() => {
          showToast(`City stop added to your itinerary!`);
        }}
      />

      <AddActivityToTripModal
        activity={selectedActivityForTrip}
        isOpen={Boolean(selectedActivityForTrip)}
        onClose={() => setSelectedActivityForTrip(null)}
        onSuccess={() => {
          showToast(`Activity added to your itinerary!`);
        }}
      />
    </div>
  );
}
