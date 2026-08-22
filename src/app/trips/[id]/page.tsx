'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  BudgetBreakdown,
  CitySummary,
  TripDetail,
  TripTimeline,
  TripStopDetail,
  ExpenseCategory,
} from '@/types';
import { formatDate, formatCurrency, calculateDurationDays, toNormalizedYMD } from '@/lib/utils';
import {
  Calendar,
  Compass,
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
  PlusCircle,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  PieChart,
  Luggage,
  AlertTriangle,
  Plane,
  Building,
  Utensils,
  ShoppingBag,
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
  const [activeTab, setActiveTab] = useState<'timeline' | 'builder' | 'budget'>('timeline');

  // Cities for adding stops
  const [availableCities, setAvailableCities] = useState<CitySummary[]>([]);

  // Modals & form state
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [activeStopForActivity, setActiveStopForActivity] = useState<TripStopDetail | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Add Stop form fields
  const [stopCityId, setStopCityId] = useState('');
  const [stopArrival, setStopArrival] = useState('');
  const [stopDeparture, setStopDeparture] = useState('');
  const [stopTransportType, setStopTransportType] = useState('Flight');
  const [stopTransportCost, setStopTransportCost] = useState('0');
  const [stopAccommodationName, setStopAccommodationName] = useState('');
  const [stopAccommodationCost, setStopAccommodationCost] = useState('0');
  const [stopNotes, setStopNotes] = useState('');
  const [stopSubmitting, setStopSubmitting] = useState(false);

  // Add Activity form fields
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState('SIGHTSEEING');
  const [actDate, setActDate] = useState('');
  const [actTime, setActTime] = useState('10:00');
  const [actDuration, setActDuration] = useState('60');
  const [actCost, setActCost] = useState('0');
  const [actNotes, setActNotes] = useState('');
  const [actSubmitting, setActSubmitting] = useState(false);

  // Add Expense form fields
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('MEALS');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState('');
  const [expNotes, setExpNotes] = useState('');
  const [expSubmitting, setExpSubmitting] = useState(false);

  // Toast / Banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchTripData = async () => {
    setLoading(true);
    setError(null);
    try {
      const tripData = await api.getTrip(tripId);
      setTrip(tripData);

      const [budgetData, timelineData, citiesList] = await Promise.all([
        api.getTripBudget(tripId).catch(() => null),
        api.getTripTimeline(tripId).catch(() => null),
        api.getCities({ limit: 100 }).catch(() => []),
      ]);

      if (budgetData) setBudget(budgetData);
      if (timelineData) setTimeline(timelineData);
      if (citiesList) setAvailableCities(citiesList);
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

  // Handle Public Sharing Toggle
  const handleShare = async () => {
    if (!trip) return;
    try {
      const res = await api.shareTrip(trip.id, 'PUBLIC');
      const shareUrl = `${window.location.origin}/share/${res.shareSlug}`;
      navigator.clipboard.writeText(shareUrl);
      showToast(`Public share link copied to clipboard! 🌍`);
      setTrip({ ...trip, visibility: 'PUBLIC', shareSlug: res.shareSlug });
    } catch (err: any) {
      alert(err.message || 'Failed to generate share link');
    }
  };

  // Handle Trip Clone
  const handleClone = async () => {
    if (!trip) return;
    try {
      const cloned = await api.cloneTrip(trip.id);
      showToast('Trip successfully cloned to your account!');
      router.push(`/trips/${cloned.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to clone trip');
    }
  };

  // Handle Trip Deletion
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

  // Handle Stop Addition
  const handleAddStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !stopCityId) return;

    setStopSubmitting(true);
    try {
      await api.addTripStop(trip.id, {
        cityId: stopCityId,
        arrivalDate: new Date(`${stopArrival}T00:00:00.000Z`).toISOString(),
        departureDate: new Date(`${stopDeparture}T00:00:00.000Z`).toISOString(),
        transportType: stopTransportType || undefined,
        transportCost: Number(stopTransportCost) || 0,
        accommodationName: stopAccommodationName || undefined,
        accommodationCost: Number(stopAccommodationCost) || 0,
        notes: stopNotes || undefined,
      });

      setShowAddStopModal(false);
      showToast('City stop successfully added to your itinerary!');
      await fetchTripData();
    } catch (err: any) {
      alert(err.message || 'Failed to add stop');
    } finally {
      setStopSubmitting(false);
    }
  };

  // Handle Stop Deletion
  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Remove this destination stop and all its scheduled activities?')) return;
    try {
      await api.removeTripStop(tripId, stopId);
      showToast('Stop removed from itinerary');
      await fetchTripData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove stop');
    }
  };

  // Handle Stop Reordering
  const handleMoveStop = async (index: number, direction: 'up' | 'down') => {
    if (!trip?.stops) return;
    const newStops = [...trip.stops];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newStops.length) return;

    const temp = newStops[index];
    newStops[index] = newStops[targetIdx];
    newStops[targetIdx] = temp;

    try {
      await api.reorderTripStops(
        tripId,
        newStops.map((s) => s.id)
      );
      showToast('Stops reordered');
      await fetchTripData();
    } catch (err: any) {
      alert(err.message || 'Failed to reorder stops');
    }
  };

  // Handle Activity Addition
  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !activeStopForActivity) return;

    setActSubmitting(true);
    try {
      await api.addTripActivity(trip.id, activeStopForActivity.id, {
        customTitle: actTitle.trim(),
        category: actCategory,
        scheduledDate: new Date(`${actDate}T00:00:00.000Z`).toISOString(),
        startTime: actTime || undefined,
        durationMinutes: Number(actDuration) || 60,
        actualCost: Number(actCost) || 0,
        notes: actNotes || undefined,
      });

      setShowAddActivityModal(false);
      showToast('Activity scheduled into stop!');
      await fetchTripData();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule activity');
    } finally {
      setActSubmitting(false);
    }
  };

  // Handle Activity Deletion
  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Remove this activity from your itinerary?')) return;
    try {
      await api.removeTripActivity(tripId, activityId);
      showToast('Activity removed');
      await fetchTripData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove activity');
    }
  };

  // Handle Activity Status Toggle
  const handleToggleActivityStatus = async (activityId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PLANNED' : 'COMPLETED';
    try {
      await api.updateTripActivity(tripId, activityId, { status: nextStatus });
      showToast(nextStatus === 'COMPLETED' ? 'Activity marked completed! 🎉' : 'Activity marked planned');
      await fetchTripData();
    } catch (err: any) {
      alert(err.message || 'Failed to update activity status');
    }
  };

  // Handle Custom Expense Addition
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !expTitle || !expAmount) return;

    setExpSubmitting(true);
    try {
      await api.addExpense(trip.id, {
        category: expCategory,
        title: expTitle.trim(),
        amount: Number(expAmount),
        currency: trip.currency,
        date: expDate ? new Date(`${expDate}T00:00:00.000Z`).toISOString() : undefined,
        notes: expNotes || undefined,
      });

      setShowAddExpenseModal(false);
      setExpTitle('');
      setExpAmount('');
      setExpNotes('');
      showToast('Expense recorded successfully!');
      await fetchTripData();
    } catch (err: any) {
      alert(err.message || 'Failed to add expense');
    } finally {
      setExpSubmitting(false);
    }
  };

  // Handle Expense Deletion
  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.deleteExpense(tripId, expenseId);
      showToast('Expense deleted');
      await fetchTripData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading itinerary and budget details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-md text-center space-y-4">
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
  const totalCost = budget?.totalEstimatedCost || 0;
  const budgetLimit = trip.totalBudget || 0;
  const budgetPercentage = budgetLimit > 0 ? Math.min(100, Math.round((totalCost / budgetLimit) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Cover Header */}
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
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-sky-600/90 hover:bg-sky-600 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-sky-400/30 transition-all no-print shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{trip.visibility === 'PUBLIC' ? 'Shared (Copy Link)' : 'Publish & Share'}</span>
            </button>

            {trip.shareSlug && (
              <Link
                href={`/share/${trip.shareSlug}`}
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1 bg-emerald-600/80 hover:bg-emerald-600 backdrop-blur-md text-white text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-400/30 transition-all no-print"
              >
                <Globe2 className="w-3.5 h-3.5" />
                View Public
              </Link>
            )}

            <button
              onClick={handleClone}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all no-print"
              title="Clone / Copy trip"
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
                  Private Itinerary
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
              <span>Target: {formatCurrency(trip.totalBudget, trip.currency)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{trip.stops?.length || 0} Destination Stops</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between overflow-x-auto no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Day-by-Day Timeline
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'builder'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Itinerary Builder ({trip.stops?.length || 0} Stops)
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'budget'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Budget Breakdown & Expenses
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setStopArrival(toNormalizedYMD(trip.startDate));
                setStopDeparture(toNormalizedYMD(trip.endDate));
                setShowAddStopModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Stop</span>
            </button>

            <button
              onClick={() => {
                setExpDate(toNormalizedYMD(trip.startDate));
                setShowAddExpenseModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Overbudget Warning Alert */}
        {budget?.isOverBudget && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-rose-900 flex items-center justify-between gap-4 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Over-Budget Alert</h3>
                <p className="text-xs text-rose-700">
                  Total estimated costs ({formatCurrency(budget.totalEstimatedCost, trip.currency)}) exceed your target budget of {formatCurrency(budget.totalBudget, trip.currency)} by{' '}
                  <strong className="text-rose-900">{formatCurrency(budget.overBudgetAmount, trip.currency)}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('budget')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0"
            >
              View Breakdown
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: DAY-BY-DAY TIMELINE & CALENDAR */}
        {/* ========================================================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {timeline && timeline.days && timeline.days.length > 0 ? (
              <div className="space-y-4">
                {timeline.days.map((day) => (
                  <div
                    key={day.dayIndex}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
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

                    {/* Scheduled Activities with Checkbox Completion */}
                    {day.activities && day.activities.length > 0 ? (
                      <div className="space-y-2.5 pt-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Scheduled Day Schedule
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {day.activities.map((act) => (
                            <div
                              key={act.id}
                              className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                                act.status === 'COMPLETED'
                                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-600'
                                  : 'bg-slate-50/70 border-slate-200/80 text-slate-800'
                              }`}
                            >
                              <button
                                onClick={() => handleToggleActivityStatus(act.id, act.status)}
                                className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Toggle completed status"
                              >
                                <CheckCircle2
                                  className={`w-5 h-5 ${
                                    act.status === 'COMPLETED'
                                      ? 'text-emerald-600 fill-emerald-100'
                                      : 'text-slate-300 hover:text-emerald-500'
                                  }`}
                                />
                              </button>

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs font-bold truncate ${
                                    act.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-900'
                                  }`}
                                >
                                  {act.title}
                                </p>
                                <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  {act.startTime && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      {act.startTime}
                                    </span>
                                  )}
                                  <span>{act.durationMinutes}m • {act.category}</span>
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-bold text-slate-800 block">
                                  {formatCurrency(act.cost, trip.currency)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">No activities scheduled for this day.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Your timeline is ready for stops</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add multi-city destination stops and activities to generate a day-by-day continuous timeline.
                </p>
                <button
                  onClick={() => setShowAddStopModal(true)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold"
                >
                  Add First Stop
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ITINERARY BUILDER & STOPS SEQUENCE */}
        {/* ========================================================= */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Multi-City Stops & Activities</h2>
                <p className="text-xs text-slate-500">
                  Organize destination sequences, reorder cities, and attach curated activities.
                </p>
              </div>
              <button
                onClick={() => {
                  setStopArrival(toNormalizedYMD(trip.startDate));
                  setStopDeparture(toNormalizedYMD(trip.endDate));
                  setShowAddStopModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-sky-400" />
                Add Destination Stop
              </button>
            </div>

            {trip.stops && trip.stops.length > 0 ? (
              <div className="space-y-6">
                {trip.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6"
                  >
                    {/* Stop Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 font-extrabold flex items-center justify-center text-sm border border-sky-200">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-sky-600" />
                            {stop.city.name}, {stop.city.country}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {formatDate(stop.arrivalDate)} to {formatDate(stop.departureDate)}
                          </p>
                        </div>
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveStop(idx, 'up')}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30"
                          title="Move Stop Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === (trip.stops?.length || 0) - 1}
                          onClick={() => handleMoveStop(idx, 'down')}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30"
                          title="Move Stop Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStop(stop.id)}
                          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                          title="Remove Stop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stay & Transport Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700">
                      <div className="flex items-center gap-2.5">
                        <Building className="w-4 h-4 text-sky-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800">Accommodation:</span>{' '}
                          {stop.accommodationName || 'Not specified'} (
                          {formatCurrency(stop.accommodationCost, trip.currency)})
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Plane className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800">Transportation:</span>{' '}
                          {stop.transportType || 'Not specified'} (
                          {formatCurrency(stop.transportCost, trip.currency)})
                        </div>
                      </div>
                    </div>

                    {/* Stop's Scheduled Activities */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Scheduled Activities ({stop.activities?.length || 0})
                        </h4>
                        <button
                          onClick={() => {
                            setActiveStopForActivity(stop);
                            setActDate(toNormalizedYMD(stop.arrivalDate));
                            setShowAddActivityModal(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Add Activity
                        </button>
                      </div>

                      {stop.activities && stop.activities.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {stop.activities.map((act) => (
                            <div
                              key={act.id}
                              className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-start justify-between gap-3 shadow-xs"
                            >
                              <div className="flex items-start gap-2.5">
                                <CheckCircle2
                                  onClick={() => handleToggleActivityStatus(act.id, act.status)}
                                  className={`w-4 h-4 mt-0.5 cursor-pointer ${
                                    act.status === 'COMPLETED' ? 'text-emerald-500 fill-emerald-100' : 'text-slate-300'
                                  }`}
                                />
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{act.customTitle || act.activity?.title}</p>
                                  <p className="text-[11px] text-slate-500">
                                    {formatDate(act.scheduledDate)} {act.startTime ? `• ${act.startTime}` : ''} • {act.durationMinutes}m
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">
                                  {formatCurrency(act.actualCost, trip.currency)}
                                </span>
                                <button
                                  onClick={() => handleDeleteActivity(act.id)}
                                  className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          No activities added to this stop yet. Click &quot;Add Activity&quot; or discover places in Explore.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No destination stops added yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Construct your multi-city journey by adding your first city stop.
                </p>
                <button
                  onClick={() => setShowAddStopModal(true)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow"
                >
                  Add First Stop
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BUDGET BREAKDOWN & CUSTOM EXPENSES */}
        {/* ========================================================= */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* Header & Gauge */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Automated Budget Breakdown</h2>
                  <p className="text-xs text-slate-500">
                    Real-time financial aggregation across stays, transit, activities, meals, and miscellaneous expenses.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  Log Custom Expense
                </button>
              </div>

              {/* Progress Gauge */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">
                    Spent / Estimated: {formatCurrency(totalCost, trip.currency)}
                  </span>
                  <span className={budget?.isOverBudget ? 'text-rose-600' : 'text-slate-800'}>
                    Target Budget: {formatCurrency(budgetLimit, trip.currency)} ({budgetPercentage}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      budget?.isOverBudget
                        ? 'bg-rose-500'
                        : budgetPercentage > 85
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${budgetPercentage}%` }}
                  />
                </div>
              </div>

              {/* KPI Category Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block flex items-center gap-1">
                    <Building className="w-3 h-3 text-sky-600" />
                    Stay
                  </span>
                  <span className="text-base font-bold text-sky-950 mt-1 block">
                    {formatCurrency(budget?.categories.stay || 0, trip.currency)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block flex items-center gap-1">
                    <Plane className="w-3 h-3 text-indigo-600" />
                    Transport
                  </span>
                  <span className="text-base font-bold text-indigo-950 mt-1 block">
                    {formatCurrency(budget?.categories.transport || 0, trip.currency)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
                    <Compass className="w-3 h-3 text-amber-600" />
                    Activities
                  </span>
                  <span className="text-base font-bold text-amber-950 mt-1 block">
                    {formatCurrency(budget?.categories.activities || 0, trip.currency)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-emerald-600" />
                    Meals
                  </span>
                  <span className="text-base font-bold text-emerald-950 mt-1 block">
                    {formatCurrency(budget?.categories.meals || 0, trip.currency)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-purple-600" />
                    Misc
                  </span>
                  <span className="text-base font-bold text-purple-950 mt-1 block">
                    {formatCurrency(budget?.categories.miscellaneous || 0, trip.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Logged Expenses List */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Custom Logged Expenses</h3>

              {budget?.expenses && budget.expenses.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {budget.expenses.map((exp) => (
                    <div key={exp.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{exp.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {formatDate(exp.date)} • {exp.category} {exp.notes ? `• ${exp.notes}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrency(exp.amount, exp.currency || trip.currency)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-2">
                  No custom meal or shopping expenses logged yet. Click &quot;Log Custom Expense&quot; above.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD DESTINATION STOP */}
      {/* ========================================================= */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-400" />
                Add Destination Stop
              </h3>
              <button
                onClick={() => setShowAddStopModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStopSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Destination City <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={stopCityId}
                  onChange={(e) => setStopCityId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                >
                  <option value="">Select a city...</option>
                  {availableCities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country} ({c.costIndex})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Arrival Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={stopArrival}
                    onChange={(e) => setStopArrival(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Departure Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={stopDeparture}
                    onChange={(e) => setStopDeparture(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Accommodation Name
                  </label>
                  <input
                    type="text"
                    placeholder="Hotel / Resort / Airbnb"
                    value={stopAccommodationName}
                    onChange={(e) => setStopAccommodationName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stay Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stopAccommodationCost}
                    onChange={(e) => setStopAccommodationCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Transport Mode
                  </label>
                  <select
                    value={stopTransportType}
                    onChange={(e) => setStopTransportType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Flight">Flight ✈️</option>
                    <option value="Train">Train 🚆</option>
                    <option value="Car">Car / Rental 🚗</option>
                    <option value="Bus">Bus 🚌</option>
                    <option value="Ferry">Ferry ⛴️</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Transit Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stopTransportCost}
                    onChange={(e) => setStopTransportCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stopSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  {stopSubmitting ? 'Adding...' : 'Add Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD ACTIVITY TO STOP */}
      {/* ========================================================= */}
      {showAddActivityModal && activeStopForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                Schedule Activity in {activeStopForActivity.city.name}
              </h3>
              <button
                onClick={() => setShowAddActivityModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddActivitySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Activity Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Louvre Museum Guided Tour, Wine Tasting"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="SIGHTSEEING">Sightseeing</option>
                    <option value="FOOD">Food & Dining</option>
                    <option value="ADVENTURE">Adventure</option>
                    <option value="CULTURE">Culture</option>
                    <option value="RELAXATION">Relaxation</option>
                    <option value="SHOPPING">Shopping</option>
                    <option value="NIGHTLIFE">Nightlife</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Scheduled Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={actDuration}
                    onChange={(e) => setActDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={actCost}
                    onChange={(e) => setActCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  {actSubmitting ? 'Scheduling...' : 'Schedule Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: LOG CUSTOM EXPENSE */}
      {/* ========================================================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Log Custom Trip Expense
              </h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="MEALS">Meals & Drinks 🍽️</option>
                    <option value="TRANSPORT">Transport ✈️</option>
                    <option value="STAY">Accommodation 🏨</option>
                    <option value="ACTIVITIES">Activities 🎟️</option>
                    <option value="MISCELLANEOUS">Miscellaneous 🛍️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amount ({trip.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="45.00"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seafood Dinner at Marina, Taxi to Airport"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional notes or receipt references"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  {expSubmitting ? 'Recording...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
