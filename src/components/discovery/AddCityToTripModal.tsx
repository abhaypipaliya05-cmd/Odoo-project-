'use client';

import React, { useEffect, useState } from 'react';
import { CitySummary, TripSummary } from '@/types';
import { api } from '@/lib/api';
import {
  X,
  MapPin,
  Calendar,
  DollarSign,
  Luggage,
  Plane,
  Building,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface AddCityToTripModalProps {
  city: CitySummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tripId: string) => void;
}

export function AddCityToTripModal({
  city,
  isOpen,
  onClose,
  onSuccess,
}: AddCityToTripModalProps) {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  
  // Stop Fields
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [accommodationName, setAccommodationName] = useState('');
  const [accommodationCost, setAccommodationCost] = useState('');
  const [transportType, setTransportType] = useState('Flight');
  const [transportCost, setTransportCost] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTripId, setSuccessTripId] = useState<string | null>(null);

  // Load user trips when modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccessTripId(null);
      setError(null);
      const loadTrips = async () => {
        setLoadingTrips(true);
        try {
          const userTrips = await api.getTrips();
          setTrips(userTrips);
          if (userTrips.length > 0) {
            setSelectedTripId(userTrips[0].id);
            syncDatesWithTrip(userTrips[0]);
          }
        } catch (err: any) {
          console.error('Failed to load trips:', err);
          setError('Failed to fetch your trips. Please make sure you are signed in.');
        } finally {
          setLoadingTrips(false);
        }
      };
      loadTrips();
    }
  }, [isOpen]);

  const syncDatesWithTrip = (trip: TripSummary) => {
    const startIso = typeof trip.startDate === 'string' ? trip.startDate : trip.startDate.toISOString();
    const endIso = typeof trip.endDate === 'string' ? trip.endDate : trip.endDate.toISOString();
    setArrivalDate(startIso.split('T')[0]);
    setDepartureDate(endIso.split('T')[0]);
  };

  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      syncDatesWithTrip(trip);
    }
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !selectedTripId || !selectedTrip) return;

    setError(null);

    // Validate Stop Dates within Trip Boundaries
    const tripStart = new Date(selectedTrip.startDate);
    const tripEnd = new Date(selectedTrip.endDate);
    const stopArrival = new Date(arrivalDate);
    const stopDeparture = new Date(departureDate);

    if (isNaN(stopArrival.getTime()) || isNaN(stopDeparture.getTime())) {
      setError('Please provide valid arrival and departure dates.');
      return;
    }

    if (stopArrival > stopDeparture) {
      setError('Arrival date cannot be after departure date.');
      return;
    }

    if (stopArrival < tripStart || stopDeparture > tripEnd) {
      setError(
        `Stop dates must fall within trip dates (${formatDate(tripStart)} – ${formatDate(tripEnd)}).`
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.addTripStop(selectedTripId, {
        cityId: city.id,
        arrivalDate: new Date(arrivalDate).toISOString(),
        departureDate: new Date(departureDate).toISOString(),
        accommodationName: accommodationName.trim() || undefined,
        accommodationCost: accommodationCost ? Number(accommodationCost) : 0,
        transportType: transportType || undefined,
        transportCost: transportCost ? Number(transportCost) : 0,
        notes: notes.trim() || undefined,
      });

      setSuccessTripId(selectedTripId);
      if (onSuccess) {
        onSuccess(selectedTripId);
      }
    } catch (err: any) {
      console.error('Failed to add stop to trip:', err);
      setError(err.message || 'Failed to add destination stop to trip.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !city) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/20 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add {city.name} to Trip</h2>
              <p className="text-xs text-slate-300">
                {city.country} {city.region ? `• ${city.region}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Success Screen */}
          {successTripId ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Stop Added Successfully!</h3>
                <p className="text-xs text-slate-500">
                  <strong>{city.name}</strong> is now included in your itinerary for{' '}
                  <strong>{selectedTrip?.title}</strong>.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/trips/${successTripId}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  <span>View Updated Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Trip Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Select Target Trip</span>
                  <Link
                    href={`/trips/create?destination=${encodeURIComponent(city.name)}`}
                    className="text-sky-600 hover:text-sky-700 normal-case font-semibold text-[11px] flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    Or Create New Trip
                  </Link>
                </label>

                {loadingTrips ? (
                  <div className="p-3 rounded-xl border border-slate-200 text-xs text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                    Loading your trips...
                  </div>
                ) : trips.length > 0 ? (
                  <select
                    value={selectedTripId}
                    onChange={(e) => handleTripChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({formatDate(t.startDate)} – {formatDate(t.endDate)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                    <p className="font-semibold">No active trips found.</p>
                    <p className="text-[11px]">
                      Create a new trip to start adding destinations and activities.
                    </p>
                    <Link
                      href={`/trips/create?destination=${encodeURIComponent(city.name)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Create Trip Now
                    </Link>
                  </div>
                )}
              </div>

              {selectedTrip && (
                <>
                  {/* Trip Date Boundaries Hint */}
                  <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-[11px] text-sky-900 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>
                      Trip Date Range: <strong>{formatDate(selectedTrip.startDate)}</strong> to{' '}
                      <strong>{formatDate(selectedTrip.endDate)}</strong>
                    </span>
                  </div>

                  {/* Stop Dates Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Arrival Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Departure Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Accommodation Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        Hotel / Stay Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hotel Le Marais, Airbnb"
                        value={accommodationName}
                        onChange={(e) => setAccommodationName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-400" />
                        Stay Cost ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={accommodationCost}
                        onChange={(e) => setAccommodationCost(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Transport Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Plane className="w-3 h-3 text-slate-400" />
                        Transport Mode
                      </label>
                      <select
                        value={transportType}
                        onChange={(e) => setTransportType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      >
                        <option value="Flight">Flight ✈️</option>
                        <option value="Train">Train 🚆</option>
                        <option value="Car">Car / Rental 🚗</option>
                        <option value="Bus">Bus 🚌</option>
                        <option value="Ferry">Ferry ⛴️</option>
                        <option value="Other">Other Transit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-400" />
                        Transport Cost ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={transportCost}
                        onChange={(e) => setTransportCost(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Notes / Plans for {city.name}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Highlights, check-in details, neighborhood tips..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || trips.length === 0}
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Adding Stop...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                          Add Stop to Itinerary
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
