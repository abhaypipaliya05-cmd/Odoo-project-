'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BudgetBreakdown, TripDetail, TripTimeline } from '@/types';
import { formatDate, formatCurrency, calculateDurationDays } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  DollarSign,
  Share2,
  Copy,
  Trash2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Printer,
  Globe2,
  Lock,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [budget, setBudget] = useState<BudgetBreakdown | null>(null);
  const [timeline, setTimeline] = useState<TripTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'stops' | 'budget'>('timeline');

  const fetchTripData = async () => {
    setLoading(true);
    setError(null);
    try {
      const tripData = await api.getTrip(tripId);
      setTrip(tripData);

      // Load budget and timeline in parallel
      const [budgetData, timelineData] = await Promise.all([
        api.getTripBudget(tripId).catch(() => null),
        api.getTripTimeline(tripId).catch(() => null),
      ]);

      if (budgetData) setBudget(budgetData);
      if (timelineData) setTimeline(timelineData);
    } catch (err: any) {
      setError(err.message || 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTripData();
    }
  }, [tripId]);

  const handleShare = async () => {
    if (!trip) return;
    try {
      const res = await api.shareTrip(trip.id, 'PUBLIC');
      navigator.clipboard.writeText(res.shareUrl);
      alert(`Public share link copied to clipboard!\n${res.shareUrl}`);
      setTrip({ ...trip, visibility: 'PUBLIC', shareSlug: res.shareSlug });
    } catch (err: any) {
      alert(err.message || 'Failed to generate share link');
    }
  };

  const handleClone = async () => {
    if (!trip) return;
    try {
      const cloned = await api.cloneTrip(trip.id);
      alert('Trip successfully cloned to your account!');
      router.push(`/trips/${cloned.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to clone trip');
    }
  };

  const handleDelete = async () => {
    if (!trip) return;
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await api.deleteTrip(trip.id);
      router.push('/my-trips');
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading itinerary details from database...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-md text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Trip Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'This itinerary does not exist or has been removed.'}</p>
          <Link
            href="/my-trips"
            className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const durationDays = calculateDurationDays(trip.startDate, trip.endDate);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <div className="relative h-80 sm:h-96 w-full bg-slate-900 overflow-hidden">
        <img
          src={
            trip.coverImage ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
          }
          alt={trip.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Floating Top Controls */}
        <div className="absolute top-6 left-4 right-4 sm:left-8 sm:right-8 flex justify-between items-center z-10">
          <Link
            href="/my-trips"
            className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trips
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/20 transition-all no-print"
              title="Print itinerary"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-sky-600/90 hover:bg-sky-600 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-sky-400/30 transition-all no-print shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={handleClone}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all no-print"
              title="Clone trip"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md border border-rose-400/30 transition-all no-print"
              title="Delete trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Title & Meta */}
        <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 text-white z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/80 backdrop-blur-md text-white">
              {trip.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
              {trip.visibility === 'PUBLIC' ? (
                <>
                  <Globe2 className="w-3 h-3 text-emerald-400" />
                  Public Itinerary
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-slate-300" />
                  Private
                </>
              )}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
            {trip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)} ({durationDays} days)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Target Budget: {formatCurrency(trip.totalBudget, trip.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 space-y-8">
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2 overflow-x-auto no-print">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'timeline'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Day-by-Day Timeline
          </button>
          <button
            onClick={() => setActiveTab('stops')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'stops'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            City Stops ({trip.stops?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'budget'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Budget Overview
          </button>
        </div>

        {/* Tab 1: Timeline View */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {timeline && timeline.days && timeline.days.length > 0 ? (
              <div className="space-y-4">
                {timeline.days.map((day) => (
                  <div
                    key={day.dayIndex}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 font-extrabold flex items-center justify-center text-sm border border-sky-200">
                          D{day.dayIndex}
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-sky-600" />
                            {day.city ? `${day.city.name}, ${day.city.country}` : 'Transit / Free Exploration'}
                          </h2>
                          <p className="text-xs text-slate-500">{formatDate(day.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                        {day.accommodation && (
                          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                            Stay: {formatCurrency(day.accommodation.cost, trip.currency)}
                          </div>
                        )}
                        <div className="px-3 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl font-bold">
                          Day Total: {formatCurrency(day.dayTotalCost, trip.currency)}
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Activities */}
                    {day.activities && day.activities.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Scheduled Activities
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {day.activities.map((act) => (
                            <div
                              key={act.id}
                              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">{act.title}</p>
                                <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  {act.startTime && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      {act.startTime}
                                    </span>
                                  )}
                                  <span>{act.durationMinutes} mins</span>
                                </p>
                              </div>
                              <span className="text-xs font-bold text-slate-700">
                                {formatCurrency(act.cost, trip.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No scheduled activities for this day yet.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : trip.stops && trip.stops.length > 0 ? (
              <div className="space-y-6">
                {trip.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 font-extrabold flex items-center justify-center text-sm border border-sky-200">
                        {idx + 1}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-sky-600" />
                          {stop.city.name}, {stop.city.country}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {formatDate(stop.arrivalDate)} – {formatDate(stop.departureDate)}
                        </p>
                      </div>
                    </div>

                    {stop.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        💡 {stop.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No city stops added yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Start adding cities and activities to your journey.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Stops Overview */}
        {activeTab === 'stops' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Multi-City Stops Sequence</h2>
            <div className="divide-y divide-slate-100">
              {trip.stops?.map((stop, idx) => (
                <div key={stop.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{stop.city.name}, {stop.city.country}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(stop.arrivalDate)} to {formatDate(stop.departureDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">
                      {formatCurrency(stop.transportCost + stop.accommodationCost, trip.currency)}
                    </p>
                    <p className="text-[11px] text-slate-400">Total Stop Cost</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Budget Breakdown */}
        {activeTab === 'budget' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Financial Summary & Budget</h2>
                <p className="text-xs text-slate-500">Real-time breakdown aggregated from database</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase block">Target Budget</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formatCurrency(budget ? budget.totalBudget : trip.totalBudget, trip.currency)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider block">
                  Stay / Accommodation
                </span>
                <span className="text-lg font-bold text-sky-950 mt-1 block">
                  {formatCurrency(budget?.categories.stay || 0, trip.currency)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider block">
                  Transportation
                </span>
                <span className="text-lg font-bold text-indigo-950 mt-1 block">
                  {formatCurrency(budget?.categories.transport || 0, trip.currency)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Activities & Meals
                </span>
                <span className="text-lg font-bold text-emerald-950 mt-1 block">
                  {formatCurrency((budget?.categories.activities || 0) + (budget?.categories.meals || 0), trip.currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
