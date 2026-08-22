'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { TripSummary } from '@/types';
import { TripCard } from '@/components/trips/TripCard';
import {
  Plane,
  PlusCircle,
  Search,
  RefreshCw,
  AlertCircle,
  Grid,
  List,
  Sparkles,
} from 'lucide-react';

export default function MyTripsPage() {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTrips({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      setTrips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, searchQuery]);

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await api.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  const handleCloneTrip = async (tripId: string) => {
    try {
      const cloned = await api.cloneTrip(tripId);
      setTrips((prev) => [cloned, ...prev]);
      alert('Trip successfully cloned to your account!');
    } catch (err: any) {
      alert(err.message || 'Failed to clone trip');
    }
  };

  const handleShareTrip = async (tripId: string) => {
    try {
      const res = await api.shareTrip(tripId);
      navigator.clipboard.writeText(res.shareUrl);
      alert(`Public share link generated and copied to clipboard!\n${res.shareUrl}`);
    } catch (err: any) {
      alert(err.message || 'Failed to generate share link');
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Trips' },
    { id: 'PLANNED', label: 'Planned' },
    { id: 'IN_PROGRESS', label: 'Active Now' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Plane className="w-7 h-7 text-sky-600" />
              My Travel Itineraries
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your customized multi-city trips, dates, and budget plans.
            </p>
          </div>

          <Link
            href="/trips/create"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all active:scale-95 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Create Trip
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trips or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading your trips...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Error loading trips</h3>
              <p className="text-xs text-rose-600 mt-1">{error}</p>
              <button
                onClick={fetchTrips}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Trips Content */}
        {!loading && !error && (
          <>
            {trips.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onDelete={handleDeleteTrip}
                    onClone={handleCloneTrip}
                    onShare={handleShareTrip}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {searchQuery ? 'No matching trips found' : 'Start planning your first adventure'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {searchQuery
                      ? `We couldn't find any trips matching "${searchQuery}". Try changing your search or filter.`
                      : 'You currently have no trip plans in this category. Create an itinerary to organize destinations, activities, and budgets.'}
                  </p>
                </div>
                <div>
                  <Link
                    href="/trips/create"
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Plan New Trip
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
