'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CitySummary, ActivitySummary } from '@/types';
import { CityCard } from '@/components/discovery/CityCard';
import { CityDetailModal } from '@/components/discovery/CityDetailModal';
import { CityFilters } from '@/components/discovery/CityFilters';
import { ActivityCard } from '@/components/discovery/ActivityCard';
import { ActivityDetailModal } from '@/components/discovery/ActivityDetailModal';
import { ActivityFilters } from '@/components/discovery/ActivityFilters';
import { AddCityToTripModal } from '@/components/discovery/AddCityToTripModal';
import { AddActivityToTripModal } from '@/components/discovery/AddActivityToTripModal';
import {
  Compass,
  MapPin,
  Sparkles,
  RefreshCw,
  AlertCircle,
  SearchX,
  Bookmark,
  SlidersHorizontal,
} from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Tab: 'cities' | 'activities'
  const initialTab = searchParams.get('tab') === 'activities' ? 'activities' : 'cities';
  const [activeTab, setActiveTab] = useState<'cities' | 'activities'>(initialTab);

  // --- CITY STATE ---
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [savedCityIds, setSavedCityIds] = useState<Set<string>>(new Set());

  // City Filters
  const [citySearch, setCitySearch] = useState(searchParams.get('q') || '');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'All');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'All');
  const [selectedCostIndex, setSelectedCostIndex] = useState(searchParams.get('costIndex') || 'All');
  const [citySortBy, setCitySortBy] = useState('popularity');

  // --- ACTIVITY STATE ---
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  // Activity Filters
  const [activitySearch, setActivitySearch] = useState(searchParams.get('activityQ') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedCityId, setSelectedCityId] = useState(searchParams.get('cityId') || 'All');
  const [maxCost, setMaxCost] = useState<number | undefined>(
    searchParams.get('maxCost') ? Number(searchParams.get('maxCost')) : undefined
  );
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [activitySortBy, setActivitySortBy] = useState('rating');

  // --- MODALS STATE ---
  const [selectedCityForDetail, setSelectedCityForDetail] = useState<CitySummary | null>(null);
  const [selectedCityForTrip, setSelectedCityForTrip] = useState<CitySummary | null>(null);
  const [selectedActivityForDetail, setSelectedActivityForDetail] = useState<ActivitySummary | null>(null);
  const [selectedActivityForTrip, setSelectedActivityForTrip] = useState<ActivitySummary | null>(null);

  // Toast / notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- FETCH SAVED DESTINATIONS ---
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await api.getSavedDestinations();
        setSavedCityIds(new Set(saved.map((s) => s.id)));
      } catch {
        // Unauthenticated or error, ignore
      }
    };
    loadSaved();
  }, []);

  // --- FETCH CITIES ---
  const fetchCities = async () => {
    setLoadingCities(true);
    setCitiesError(null);
    try {
      const data = await api.getCities({
        q: citySearch || undefined,
        region: selectedRegion !== 'All' ? selectedRegion : undefined,
        country: selectedCountry !== 'All' ? selectedCountry : undefined,
        costIndex: selectedCostIndex !== 'All' ? selectedCostIndex : undefined,
      });
      setCities(data);
    } catch (err: any) {
      console.error('Failed to load cities:', err);
      setCitiesError(err.message || 'Failed to load destinations from catalog');
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [citySearch, selectedRegion, selectedCountry, selectedCostIndex]);

  // --- FETCH ACTIVITIES ---
  const fetchActivities = async () => {
    setLoadingActivities(true);
    setActivitiesError(null);
    try {
      const data = await api.getActivities({
        cityId: selectedCityId !== 'All' ? selectedCityId : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        maxCost: maxCost !== undefined ? maxCost : undefined,
        q: activitySearch || undefined,
      });
      setActivities(data);
    } catch (err: any) {
      console.error('Failed to load activities:', err);
      setActivitiesError(err.message || 'Failed to load activities catalog');
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [activitySearch, selectedCategory, selectedCityId, maxCost]);

  // --- TOGGLE SAVE DESTINATION ---
  const handleToggleSaveCity = async (cityId: string) => {
    try {
      if (savedCityIds.has(cityId)) {
        await api.removeSavedDestination(cityId);
        setSavedCityIds((prev) => {
          const next = new Set(prev);
          next.delete(cityId);
          return next;
        });
        showToast('Destination removed from wishlist');
      } else {
        await api.saveDestination(cityId);
        setSavedCityIds((prev) => new Set(prev).add(cityId));
        showToast('Destination saved to your wishlist! ❤️');
      }
    } catch (err: any) {
      console.error('Failed to toggle save destination:', err);
      showToast(err.message || 'Please log in to bookmark destinations');
    }
  };

  // --- DERIVED & SORTED CITIES ---
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    cities.forEach((c) => {
      if (c.country) set.add(c.country);
    });
    return Array.from(set).sort();
  }, [cities]);

  const sortedCities = useMemo(() => {
    const list = [...cities];
    switch (citySortBy) {
      case 'cost_asc':
        return list.sort((a, b) => a.averageDailyCost - b.averageDailyCost);
      case 'cost_desc':
        return list.sort((a, b) => b.averageDailyCost - a.averageDailyCost);
      case 'name_asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'popularity':
      default:
        return list.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
    }
  }, [cities, citySortBy]);

  const handleResetCityFilters = () => {
    setCitySearch('');
    setSelectedRegion('All');
    setSelectedCountry('All');
    setSelectedCostIndex('All');
    setCitySortBy('popularity');
  };

  // --- DERIVED & FILTERED ACTIVITIES ---
  const availableCitiesForActivities = useMemo(() => {
    const map = new Map<string, { id: string; name: string; country: string }>();
    cities.forEach((c) => {
      map.set(c.id, { id: c.id, name: c.name, country: c.country });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [cities]);

  const processedActivities = useMemo(() => {
    let list = [...activities];

    // Client Duration Filter
    if (selectedDuration !== 'All') {
      if (selectedDuration === 'short') {
        list = list.filter((a) => a.durationMinutes < 60);
      } else if (selectedDuration === 'medium') {
        list = list.filter((a) => a.durationMinutes >= 60 && a.durationMinutes <= 180);
      } else if (selectedDuration === 'long') {
        list = list.filter((a) => a.durationMinutes > 180);
      }
    }

    // Sort
    switch (activitySortBy) {
      case 'cost_asc':
        return list.sort((a, b) => a.estimatedCost - b.estimatedCost);
      case 'cost_desc':
        return list.sort((a, b) => b.estimatedCost - a.estimatedCost);
      case 'duration_asc':
        return list.sort((a, b) => a.durationMinutes - b.durationMinutes);
      case 'rating':
      default:
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  }, [activities, selectedDuration, activitySortBy]);

  const handleResetActivityFilters = () => {
    setActivitySearch('');
    setSelectedCategory('All');
    setSelectedCityId('All');
    setMaxCost(undefined);
    setSelectedDuration('All');
    setActivitySortBy('rating');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold backdrop-blur-sm border border-sky-400/20">
                <Compass className="w-3.5 h-3.5" />
                Discovery Engine
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Explore Destinations & Experiences
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Discover world-class cities, curated culinary tours, iconic landmarks, outdoor
                adventures, and schedule them seamlessly into your customized travel itineraries.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-3">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[110px]">
                <span className="text-2xl font-black block">{cities.length || 30}+</span>
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                  Destinations
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[110px]">
                <span className="text-2xl font-black block">{activities.length || 50}+</span>
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                  Experiences
                </span>
              </div>
            </div>
          </div>

          {/* Primary Discovery Tabs Navigation */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <button
              onClick={() => setActiveTab('cities')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'cities'
                  ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className={`w-4 h-4 ${activeTab === 'cities' ? 'text-sky-600' : ''}`} />
              <span>Explore Cities ({cities.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'activities'
                  ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className={`w-4 h-4 ${activeTab === 'activities' ? 'text-sky-600' : ''}`} />
              <span>Discover Activities ({activities.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Catalog Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: CITIES & DESTINATIONS */}
        {/* ========================================================= */}
        {activeTab === 'cities' && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <CityFilters
              search={citySearch}
              onSearchChange={setCitySearch}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              selectedCostIndex={selectedCostIndex}
              onCostIndexChange={setSelectedCostIndex}
              sortBy={citySortBy}
              onSortChange={setCitySortBy}
              availableCountries={availableCountries}
              onReset={handleResetCityFilters}
              totalCount={sortedCities.length}
            />

            {/* Loading State */}
            {loadingCities && (
              <div className="bg-white rounded-3xl p-16 border border-slate-200/90 shadow-sm text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">
                  Querying database for world-class destinations...
                </p>
              </div>
            )}

            {/* Error State */}
            {citiesError && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-rose-800 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-sm">Failed to retrieve destinations</h3>
                  <p className="text-xs text-rose-600 leading-relaxed">{citiesError}</p>
                  <button
                    onClick={fetchCities}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Retry Query
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loadingCities && !citiesError && sortedCities.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-16 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                  <SearchX className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">No destinations found</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    No cities match your current search filters. Try adjusting your query, region,
                    or cost index.
                  </p>
                </div>
                <button
                  onClick={handleResetCityFilters}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Cities Cards Grid */}
            {!loadingCities && !citiesError && sortedCities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCities.map((city) => (
                  <CityCard
                    key={city.id}
                    city={city}
                    isSaved={savedCityIds.has(city.id)}
                    onToggleSave={handleToggleSaveCity}
                    onViewDetails={(c) => setSelectedCityForDetail(c)}
                    onAddToTrip={(c) => setSelectedCityForTrip(c)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ACTIVITIES & EXPERIENCES */}
        {/* ========================================================= */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <ActivityFilters
              search={activitySearch}
              onSearchChange={setActivitySearch}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedCityId={selectedCityId}
              onCityChange={setSelectedCityId}
              maxCost={maxCost}
              onMaxCostChange={setMaxCost}
              selectedDuration={selectedDuration}
              onDurationChange={setSelectedDuration}
              sortBy={activitySortBy}
              onSortChange={setActivitySortBy}
              availableCities={availableCitiesForActivities}
              onReset={handleResetActivityFilters}
              totalCount={processedActivities.length}
            />

            {/* Loading State */}
            {loadingActivities && (
              <div className="bg-white rounded-3xl p-16 border border-slate-200/90 shadow-sm text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">
                  Querying database for curated activities & tours...
                </p>
              </div>
            )}

            {/* Error State */}
            {activitiesError && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-rose-800 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-sm">Failed to retrieve activities</h3>
                  <p className="text-xs text-rose-600 leading-relaxed">{activitiesError}</p>
                  <button
                    onClick={fetchActivities}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Retry Query
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loadingActivities && !activitiesError && processedActivities.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-16 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                  <SearchX className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">No activities found</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    No experiences matched your search criteria. Try modifying your category, city,
                    or max cost filters.
                  </p>
                </div>
                <button
                  onClick={handleResetActivityFilters}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Activities Cards Grid */}
            {!loadingActivities && !activitiesError && processedActivities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedActivities.map((act) => (
                  <ActivityCard
                    key={act.id}
                    activity={act}
                    onViewDetails={(a) => setSelectedActivityForDetail(a)}
                    onAddToTrip={(a) => setSelectedActivityForTrip(a)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* 1. City Details Modal */}
      <CityDetailModal
        city={selectedCityForDetail}
        isOpen={Boolean(selectedCityForDetail)}
        onClose={() => setSelectedCityForDetail(null)}
        isSaved={selectedCityForDetail ? savedCityIds.has(selectedCityForDetail.id) : false}
        onToggleSave={handleToggleSaveCity}
        onAddToTrip={(city) => {
          setSelectedCityForDetail(null);
          setSelectedCityForTrip(city);
        }}
        onAddActivityToTrip={(act) => {
          setSelectedCityForDetail(null);
          setSelectedActivityForTrip(act);
        }}
      />

      {/* 2. Add City to Trip Modal */}
      <AddCityToTripModal
        city={selectedCityForTrip}
        isOpen={Boolean(selectedCityForTrip)}
        onClose={() => setSelectedCityForTrip(null)}
        onSuccess={() => {
          showToast(`City added to trip itinerary!`);
        }}
      />

      {/* 3. Activity Quick View Modal */}
      <ActivityDetailModal
        activity={selectedActivityForDetail}
        isOpen={Boolean(selectedActivityForDetail)}
        onClose={() => setSelectedActivityForDetail(null)}
        onAddToTrip={(act) => {
          setSelectedActivityForDetail(null);
          setSelectedActivityForTrip(act);
        }}
      />

      {/* 4. Add Activity to Trip Modal */}
      <AddActivityToTripModal
        activity={selectedActivityForTrip}
        isOpen={Boolean(selectedActivityForTrip)}
        onClose={() => setSelectedActivityForTrip(null)}
        onSuccess={() => {
          showToast(`Activity successfully scheduled into trip!`);
        }}
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Initializing Discovery Hub...</p>
          </div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
