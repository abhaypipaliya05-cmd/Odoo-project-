'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CitySummary } from '@/types';
import {
  Compass,
  Search,
  Bookmark,
  PlusCircle,
  Star,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function ExplorePage() {
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const fetchCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCities({
        q: search || undefined,
        region: selectedRegion !== 'All' ? selectedRegion : undefined,
      });
      setCities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [search, selectedRegion]);

  const handleToggleSave = async (cityId: string) => {
    try {
      await api.saveDestination(cityId);
      alert('Destination saved to your wishlist!');
    } catch (err: any) {
      console.error('Failed to save:', err);
    }
  };

  const regions = ['All', 'Asia', 'Europe', 'North America', 'Americas'];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Compass className="w-7 h-7 text-sky-600" />
              Explore Global Destinations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Discover top cities, cost indices, seasonal recommendations, and plan your next journey.
            </p>
          </div>
        </div>

        {/* Search & Region Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedRegion === region
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cities, countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading destination catalog from database...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Failed to retrieve destinations</h3>
              <p className="text-xs text-rose-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Destination Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <div
                key={city.id}
                className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={city.imageUrl}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <button
                    onClick={() => handleToggleSave(city.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors"
                    title="Save to wishlist"
                  >
                    <Bookmark className="w-4 h-4 text-white" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-lg">{city.name}</h3>
                    <p className="text-xs text-slate-200">{city.country} {city.region ? `• ${city.region}` : ''}</p>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {city.description}
                  </p>

                  <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Daily Cost</span>
                      <span className="font-bold text-slate-900">${city.averageDailyCost} / day</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{city.popularityScore}</span>
                    </div>
                  </div>

                  <Link
                    href={`/trips/create?destination=${encodeURIComponent(city.name)}`}
                    className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Plan Trip to {city.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
