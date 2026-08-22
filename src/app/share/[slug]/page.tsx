'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PublicTripDetail } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Compass,
  Calendar,
  MapPin,
  DollarSign,
  Copy,
  Share2,
  RefreshCw,
  AlertCircle,
  Globe2,
  User as UserIcon,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function PublicSharedTripPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [trip, setTrip] = useState<PublicTripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadShared() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPublicTrip(slug);
        setTrip(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load shared itinerary');
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadShared();
    }
  }, [slug]);

  const handleClone = async () => {
    if (!trip) return;
    try {
      const cloned = await api.cloneTrip(trip.id);
      alert('Trip successfully copied into your GlobeTrotter account!');
      router.push(`/trips/${cloned.id}`);
    } catch (err: any) {
      alert('Please log in to copy this itinerary to your account.');
      router.push('/login');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading public shared itinerary from database...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-md text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Itinerary Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'This shared link is invalid or has expired.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Go to GlobeTrotter Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Cover */}
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

        <div className="absolute top-6 left-4 right-4 sm:left-8 sm:right-8 flex justify-between items-center z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/20"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            GlobeTrotter
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/20 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleClone}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Copy className="w-4 h-4" />
              <span>Copy / Fork Trip</span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 text-white z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/80 backdrop-blur-md text-white">
            <Globe2 className="w-3.5 h-3.5" />
            Shared Public Itinerary
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
            {trip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)} ({trip.durationDays} days)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Estimated Budget: {formatCurrency(trip.totalBudget, trip.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 space-y-6">
        {/* Creator Banner */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold overflow-hidden">
              {trip.creator.avatarUrl ? (
                <img src={trip.creator.avatarUrl} alt={trip.creator.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Shared by {trip.creator.name || 'GlobeTrotter Traveler'}</p>
              <p className="text-sm font-bold text-slate-900">Custom Multi-City Travel Plan</p>
            </div>
          </div>

          <button
            onClick={handleClone}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            Clone to My Trips
          </button>
        </div>

        {/* Stops & Schedule */}
        <div className="space-y-6">
          {trip.stops && trip.stops.length > 0 ? (
            trip.stops.map((stop, idx) => (
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

                {stop.activities && stop.activities.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Activities & Experiences
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stop.activities.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800">{act.title}</p>
                            <p className="text-[11px] text-slate-500">{act.durationMinutes} mins • {act.category}</p>
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {formatCurrency(act.estimatedCost, trip.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 text-xs border border-slate-200">
              No detailed city stops attached to this preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
