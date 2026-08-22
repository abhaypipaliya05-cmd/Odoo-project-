'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trip } from '@/types';
import { formatDate, formatCurrency, calculateDurationDays } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  MoreVertical,
  Share2,
  Copy,
  Trash2,
  Edit3,
  Eye,
  DollarSign,
  Globe2,
  Lock,
  Sparkles,
} from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
  onClone?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function TripCard({ trip, onDelete, onClone, onShare }: TripCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const durationDays = calculateDurationDays(trip.startDate, trip.endDate);

  const statusConfig = {
    upcoming: { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', label: 'Upcoming' },
    ongoing: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500 animate-ping', label: 'Active Now' },
    completed: { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Completed' },
  };

  const currentStatus = statusConfig[trip.status] || statusConfig.upcoming;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Cover Image Header */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={
            trip.coverImage ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
          }
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${currentStatus.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
              {currentStatus.label}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-white border border-white/20">
              {trip.visibility === 'public' ? (
                <>
                  <Globe2 className="w-3 h-3 text-emerald-400" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-slate-300" />
                  Private
                </>
              )}
            </span>
          </div>

          {/* Quick Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              aria-label="Trip actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    href={`/trips/${trip.id}`}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="w-4 h-4 text-slate-400" />
                    View Itinerary
                  </Link>

                  <Link
                    href={`/trips/${trip.id}/edit`}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="w-4 h-4 text-slate-400" />
                    Edit Details
                  </Link>

                  {onClone && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onClone(trip.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                      Clone Trip
                    </button>
                  )}

                  {onShare && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onShare(trip.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                    >
                      <Share2 className="w-4 h-4 text-slate-400" />
                      Share Link
                    </button>
                  )}

                  {onDelete && (
                    <>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(trip.id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        Delete Trip
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title over cover bottom */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-bold leading-snug drop-shadow-md truncate">{trip.title}</h3>
          <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5 drop-shadow">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)} ({durationDays} {durationDays === 1 ? 'day' : 'days'})
            </span>
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-4">
        {/* Description or Destinations */}
        <div>
          {trip.description && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
              {trip.description}
            </p>
          )}

          {/* Destinations summary tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            {trip.destinations && trip.destinations.length > 0 ? (
              trip.destinations.slice(0, 3).map((dest, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                >
                  {dest}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500">
                {trip.destinationCount || 1} destination stop{(trip.destinationCount || 1) > 1 ? 's' : ''}
              </span>
            )}
            {trip.destinations && trip.destinations.length > 3 && (
              <span className="text-[11px] text-slate-400 font-medium">
                +{trip.destinations.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Financial & Action Footer */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
              Budget Target
            </span>
            <span className="text-sm font-bold text-slate-900">
              {formatCurrency(trip.budget, trip.currency)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onShare && (
              <button
                onClick={() => onShare(trip.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 transition-colors"
                title="Share Trip"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <Link
              href={`/trips/${trip.id}`}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <span>View Itinerary</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
