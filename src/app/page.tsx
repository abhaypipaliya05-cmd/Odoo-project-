'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { CitySummary, DashboardStats, TripSummary } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TripCard } from '@/components/trips/TripCard';
import {
  Compass,
  PlusCircle,
  MapPin,
  Calendar,
  DollarSign,
  Bookmark,
  ArrowRight,
  Sparkles,
  Plane,
  Luggage,
  RefreshCw,
  AlertCircle,
  Star,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, demoLogin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const handleToggleSave = async (cityId: string) => {
    try {
      await api.saveDestination(cityId);
      fetchStats();
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleTripDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await api.deleteTrip(tripId);
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  const handleTripClone = async (tripId: string) => {
    try {
      await api.cloneTrip(tripId);
      fetchStats();
      alert('Trip successfully cloned to your account!');
    } catch (err: any) {
      alert(err.message || 'Failed to clone trip');
    }
  };

  const handleTripShare = async (tripId: string) => {
    try {
      const res = await api.shareTrip(tripId);
      navigator.clipboard.writeText(res.shareUrl);
      alert(`Public share link copied to clipboard!\n${res.shareUrl}`);
    } catch (err: any) {
      alert(err.message || 'Failed to generate share link');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold backdrop-blur-sm border border-sky-400/20">
                <Sparkles className="w-3.5 h-3.5" />
                GlobeTrotter Travel Hub
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Welcome back, {user ? user.name.split(' ')[0] : 'Traveler'}! ✈️
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Plan personalized multi-city journeys, keep track of day-wise itineraries, explore world-class destinations, and stay comfortably within budget.
              </p>
            </div>

            {/* Quick Action Plan Button */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/trips/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-2xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all hover:scale-[1.02] active:scale-95 text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Plan New Trip
              </Link>

              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 font-medium px-4 py-3 rounded-2xl backdrop-blur-md transition-all text-sm"
              >
                <Compass className="w-4 h-4" />
                Explore Destinations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-slate-500 font-medium text-sm">Loading your personalized travel dashboard...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 flex items-start gap-4 mb-8">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Welcome to GlobeTrotter!</h3>
              <p className="text-xs text-rose-600 mt-1">Please sign in or use the demo login to load your dashboard.</p>
              <button
                onClick={() => demoLogin('traveler')}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                1-Click Demo Login
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Loaded View */}
        {!loading && stats && (
          <div className="space-y-10">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Total Trips */}
              <Link
                href="/my-trips"
                className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Trips</span>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plane className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.totalTripsCount}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.upcomingTripsCount} active / upcoming
                  </p>
                </div>
              </Link>

              {/* Card 2: Upcoming Journeys */}
              <Link
                href="/my-trips?status=PLANNED"
                className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.upcomingTripsCount}</div>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Ready for departure</p>
                </div>
              </Link>

              {/* Card 3: Saved Wishlist */}
              <Link
                href="/saved"
                className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Places</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bookmark className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.savedDestinationsCount}</div>
                  <p className="text-xs text-indigo-600 font-medium mt-1">Bucket list destinations</p>
                </div>
              </Link>

              {/* Card 4: Total Planned Budget */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Planned Budget</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {formatCurrency(stats.totalBudgetPlanned, user?.currency || 'USD')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Cumulative trip targets</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md">
              <h2 className="text-base font-bold tracking-tight mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href="/trips/create"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group"
                >
                  <PlusCircle className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xs font-bold leading-tight">Create Trip</p>
                    <p className="text-[10px] text-slate-300">Custom multi-city plan</p>
                  </div>
                </Link>

                <Link
                  href="/explore"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group"
                >
                  <MapPin className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xs font-bold leading-tight">Explore Cities</p>
                    <p className="text-[10px] text-slate-300">Global travel spots</p>
                  </div>
                </Link>

                <Link
                  href="/my-trips"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group"
                >
                  <Luggage className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xs font-bold leading-tight">My Trips</p>
                    <p className="text-[10px] text-slate-300">Manage all itineraries</p>
                  </div>
                </Link>

                <Link
                  href="/saved"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 group"
                >
                  <Bookmark className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xs font-bold leading-tight">Saved Places</p>
                    <p className="text-[10px] text-slate-300">Your wishlist</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Upcoming & Recent Trips Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Upcoming & Recent Itineraries</h2>
                  <p className="text-xs text-slate-500">Pick up where you left off or view your journey schedules</p>
                </div>
                <Link
                  href="/my-trips"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 group"
                >
                  <span>View all trips ({stats.totalTripsCount})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {stats.recentTrips && stats.recentTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.recentTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onDelete={handleTripDelete}
                      onClone={handleTripClone}
                      onShare={handleTripShare}
                    />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                    <Plane className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">No trips planned yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Start planning your first adventure! Select destinations, schedule activities, and keep track of your budget.
                    </p>
                  </div>
                  <Link
                    href="/trips/create"
                    className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create Your First Trip
                  </Link>
                </div>
              )}
            </section>

            {/* Recommended Destinations Showcase */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Recommended Destinations</h2>
                  <p className="text-xs text-slate-500">Popular global destinations powered by your real backend catalog</p>
                </div>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 group"
                >
                  <span>Explore full catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.recommendedCities?.map((dest) => (
                  <div
                    key={dest.id}
                    className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      <button
                        onClick={() => handleToggleSave(dest.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
                        title="Save to wishlist"
                      >
                        <Bookmark className="w-4 h-4 text-white" />
                      </button>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-bold text-base">{dest.name}</h3>
                        <p className="text-[11px] text-slate-200">{dest.country} {dest.region ? `• ${dest.region}` : ''}</p>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {dest.description}
                      </p>

                      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Daily</span>
                          <span className="font-bold text-slate-900">${dest.averageDailyCost}/day</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{dest.popularityScore}</span>
                        </div>
                      </div>

                      <Link
                        href={`/trips/create?destination=${encodeURIComponent(dest.name)}`}
                        className="w-full text-center py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Plan Trip to {dest.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
