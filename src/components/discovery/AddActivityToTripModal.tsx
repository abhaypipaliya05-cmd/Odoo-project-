'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ActivitySummary, TripDetail, TripSummary, TripStopDetail } from '@/types';
import { api } from '@/lib/api';
import {
  X,
  Compass,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, formatCurrency, toNormalizedYMD } from '@/lib/utils';
import Link from 'next/link';

interface AddActivityToTripModalProps {
  activity: ActivitySummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tripId: string) => void;
  onOpenAddCityStop?: (cityId: string, cityName?: string) => void;
}

export function AddActivityToTripModal({
  activity,
  isOpen,
  onClose,
  onSuccess,
  onOpenAddCityStop,
}: AddActivityToTripModalProps) {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>('');

  const [tripDetail, setTripDetail] = useState<TripDetail | null>(null);
  const [loadingTripDetail, setLoadingTripDetail] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string>('');

  // Activity Schedule Fields
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [actualCost, setActualCost] = useState('0');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTripId, setSuccessTripId] = useState<string | null>(null);

  // Keyboard accessibility: Close on Escape key
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

  // Load user trips on modal open
  useEffect(() => {
    if (isOpen) {
      setSuccessTripId(null);
      setError(null);
      if (activity) {
        setDurationMinutes(String(activity.durationMinutes || 60));
        setActualCost(
          activity.estimatedCost !== undefined && activity.estimatedCost !== null
            ? String(activity.estimatedCost)
            : '0'
        );
      }

      const loadTrips = async () => {
        setLoadingTrips(true);
        try {
          const userTrips = await api.getTrips();
          setTrips(userTrips);
          if (userTrips && userTrips.length > 0) {
            setSelectedTripId(userTrips[0].id);
          } else {
            setSelectedTripId('');
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
  }, [isOpen, activity]);

  // Load selected trip detail with stops whenever selectedTripId changes
  useEffect(() => {
    if (selectedTripId) {
      const loadTripDetail = async () => {
        setLoadingTripDetail(true);
        try {
          const detail = await api.getTrip(selectedTripId);
          setTripDetail(detail);

          if (detail.stops && detail.stops.length > 0) {
            // Check if any stop matches activity cityId
            const matchingStop = detail.stops.find((s) => s.cityId === activity?.cityId);
            const chosenStop = matchingStop || detail.stops[0];
            setSelectedStopId(chosenStop.id);
            syncScheduleDateWithStop(chosenStop);
          } else {
            setSelectedStopId('');
          }
        } catch (err: any) {
          console.error('Failed to load trip stops:', err);
        } finally {
          setLoadingTripDetail(false);
        }
      };
      loadTripDetail();
    } else {
      setTripDetail(null);
      setSelectedStopId('');
    }
  }, [selectedTripId, activity?.cityId]);

  const syncScheduleDateWithStop = (stop: TripStopDetail) => {
    const arrivalYmd = toNormalizedYMD(stop.arrivalDate);
    setScheduledDate(arrivalYmd);
  };

  const handleStopChange = (stopId: string) => {
    setSelectedStopId(stopId);
    const stop = tripDetail?.stops?.find((s) => s.id === stopId);
    if (stop) {
      syncScheduleDateWithStop(stop);
    }
  };

  const selectedStop = tripDetail?.stops?.find((s) => s.id === selectedStopId);
  const matchingStopExists = tripDetail?.stops?.some((s) => s.cityId === activity?.cityId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity || !selectedTripId || !selectedStopId || !selectedStop) return;

    setError(null);

    // Normalize dates for boundary checks
    const stopArrival = toNormalizedYMD(selectedStop.arrivalDate);
    const stopDeparture = toNormalizedYMD(selectedStop.departureDate);
    const actDate = toNormalizedYMD(scheduledDate);

    if (!actDate) {
      setError('Please select a valid scheduled date.');
      return;
    }

    if (actDate < stopArrival || actDate > stopDeparture) {
      setError(
        `Scheduled date must fall within stop dates for ${selectedStop.city.name} (${formatDate(
          selectedStop.arrivalDate
        )} – ${formatDate(selectedStop.departureDate)}).`
      );
      return;
    }

    setSubmitting(true);
    try {
      const costValue =
        actualCost !== '' && actualCost !== null && !isNaN(Number(actualCost))
          ? Number(actualCost)
          : 0;

      const durationValue =
        durationMinutes !== '' && durationMinutes !== null && !isNaN(Number(durationMinutes))
          ? Number(durationMinutes)
          : 60;

      await api.addTripActivity(selectedTripId, selectedStopId, {
        activityId: activity.id,
        scheduledDate: new Date(`${actDate}T00:00:00.000Z`).toISOString(),
        startTime: startTime || undefined,
        durationMinutes: durationValue,
        actualCost: costValue,
        category: activity.category,
        notes: notes.trim() || undefined,
      });

      setSuccessTripId(selectedTripId);
      if (onSuccess) {
        onSuccess(selectedTripId);
      }
    } catch (err: any) {
      console.error('Failed to add activity to trip stop:', err);
      setError(err.message || 'Failed to schedule activity in trip.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !activity) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-activity-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto"
    >
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
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-activity-modal-title" className="text-lg font-bold truncate max-w-xs">
                {activity.title}
              </h2>
              <p className="text-xs text-slate-300">
                {activity.category} • {activity.cityName || 'Curated Experience'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close modal (Esc)"
            aria-label="Close modal"
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
                <h3 className="text-lg font-bold text-slate-900">Activity Scheduled!</h3>
                <p className="text-xs text-slate-500">
                  <strong>{activity.title}</strong> has been added to your itinerary for{' '}
                  <strong>{selectedStop?.city.name}</strong>.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/trips/${successTripId}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  <span>View Timeline & Itinerary</span>
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
          ) : loadingTrips ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading your trip list...</p>
            </div>
          ) : trips.length === 0 ? (
            /* Tripless Empty State */
            <div className="p-8 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 mx-auto flex items-center justify-center">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No Trips Created Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  You do not have any trips yet. Create a new trip to schedule{' '}
                  <strong>{activity.title}</strong> into your itinerary.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  href={`/trips/create?destination=${encodeURIComponent(activity.cityName || '')}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-sky-400" />
                  Create a Trip
                </Link>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
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

              {/* Trip Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Choose Trip Itinerary</span>
                  <Link
                    href={`/trips/create?destination=${encodeURIComponent(activity.cityName || '')}`}
                    className="text-sky-600 hover:text-sky-700 normal-case font-semibold text-[11px] flex items-center gap-1"
                  >
                    <PlusCircle className="w-3 h-3" />
                    New Trip
                  </Link>
                </label>

                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({formatDate(t.startDate)} – {formatDate(t.endDate)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stop Selector & Missing Stop Handling */}
              {selectedTripId && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target City Stop
                  </label>

                  {loadingTripDetail ? (
                    <div className="p-3 rounded-xl border border-slate-200 text-xs text-slate-400 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                      Loading trip stops...
                    </div>
                  ) : tripDetail?.stops && tripDetail.stops.length > 0 ? (
                    <div className="space-y-2.5">
                      <select
                        value={selectedStopId}
                        onChange={(e) => handleStopChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      >
                        {tripDetail.stops.map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            {stop.city.name}, {stop.city.country} ({formatDate(stop.arrivalDate)} –{' '}
                            {formatDate(stop.departureDate)})
                            {stop.cityId === activity.cityId ? ' ★ (Matching Destination)' : ''}
                          </option>
                        ))}
                      </select>

                      {/* Missing Stop Warning Banner if selected stop is not matching activity city */}
                      {!matchingStopExists && activity.cityName && (
                        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Destination Note</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-amber-700">
                            This trip does not currently have a stop for{' '}
                            <strong>{activity.cityName}</strong>. You can schedule this activity
                            under an existing stop, or add{' '}
                            <strong>{activity.cityName}</strong> to your trip first.
                          </p>
                          <Link
                            href={`/trips/${selectedTripId}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 underline hover:text-amber-950"
                          >
                            <MapPin className="w-3 h-3" />
                            Add {activity.cityName} Stop in Itinerary
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Trip has zero stops */
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>No Destination Stops in Selected Trip</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-700">
                        This trip doesn&apos;t have any destination stops yet. Add{' '}
                        <strong>{activity.cityName || 'the city'}</strong> to this trip before
                        scheduling activities.
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        <Link
                          href={`/trips/${selectedTripId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold shadow-sm"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Add Stop to Trip
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stop & Date Fields */}
              {selectedStop && (
                <>
                  <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-[11px] text-sky-900 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>
                      Stop at <strong>{selectedStop.city.name}</strong> from{' '}
                      <strong>{formatDate(selectedStop.arrivalDate)}</strong> to{' '}
                      <strong>{formatDate(selectedStop.departureDate)}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Scheduled Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-400" />
                        Estimated / Actual Cost ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={actualCost}
                        onChange={(e) => setActualCost(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Personal Notes & Instructions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ticket confirmation, meeting point, attire notes..."
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
                      disabled={submitting || !selectedStopId}
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                          Schedule Activity
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
