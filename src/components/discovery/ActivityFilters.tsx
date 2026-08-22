'use client';

import React from 'react';
import {
  Search,
  X,
  MapPin,
  ArrowUpDown,
  Clock,
  DollarSign,
  Utensils,
  Compass,
  Footprints,
  Landmark,
  Palmtree,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface ActivityFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedCityId: string;
  onCityChange: (val: string) => void;
  maxCost: number | undefined;
  onMaxCostChange: (val: number | undefined) => void;
  selectedDuration: string;
  onDurationChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  availableCities: { id: string; name: string; country: string }[];
  onReset: () => void;
  totalCount: number;
}

const CATEGORIES = [
  { label: 'All Categories', value: 'All', icon: Compass },
  { label: 'Sightseeing', value: 'SIGHTSEEING', icon: Compass },
  { label: 'Food & Dining', value: 'FOOD', icon: Utensils },
  { label: 'Adventure', value: 'ADVENTURE', icon: Footprints },
  { label: 'Culture & Arts', value: 'CULTURE', icon: Landmark },
  { label: 'Relaxation', value: 'RELAXATION', icon: Palmtree },
  { label: 'Shopping', value: 'SHOPPING', icon: ShoppingBag },
  { label: 'Nightlife', value: 'NIGHTLIFE', icon: Sparkles },
];

const COST_PRESETS = [
  { label: 'Any Cost', value: undefined },
  { label: 'Free ($0)', value: 0 },
  { label: 'Under $25', value: 25 },
  { label: 'Under $50', value: 50 },
  { label: 'Under $100', value: 100 },
];

const DURATION_OPTIONS = [
  { label: 'Any Duration', value: 'All' },
  { label: 'Quick (< 1 hr)', value: 'short' },
  { label: 'Half-day (1-3 hrs)', value: 'medium' },
  { label: 'Full-day (3+ hrs)', value: 'long' },
];

export function ActivityFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCityId,
  onCityChange,
  maxCost,
  onMaxCostChange,
  selectedDuration,
  onDurationChange,
  sortBy,
  onSortChange,
  availableCities,
  onReset,
  totalCount,
}: ActivityFiltersProps) {
  const isFiltered =
    Boolean(search) ||
    selectedCategory !== 'All' ||
    selectedCityId !== 'All' ||
    maxCost !== undefined ||
    selectedDuration !== 'All' ||
    sortBy !== 'rating';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activities, tours, dining, experiences..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns Row: City, Duration & Sort */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* City Selector */}
          <div className="relative min-w-[140px] flex-1 sm:flex-initial">
            <select
              value={selectedCityId}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-700 appearance-none pr-8 cursor-pointer"
            >
              <option value="All">All Cities</option>
              {availableCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.country}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Duration Selector */}
          <div className="relative min-w-[130px] flex-1 sm:flex-initial">
            <select
              value={selectedDuration}
              onChange={(e) => onDurationChange(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-700 appearance-none pr-8 cursor-pointer"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative min-w-[140px] flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-700 appearance-none pr-8 cursor-pointer"
            >
              <option value="rating">Rating (High to Low)</option>
              <option value="cost_asc">Cost (Low to High)</option>
              <option value="cost_desc">Cost (High to Low)</option>
              <option value="duration_asc">Duration (Short to Long)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="px-3 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1 shrink-0"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cost Presets Row */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Max Cost:
          </span>
          {COST_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onMaxCostChange(preset.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                maxCost === preset.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="text-xs text-slate-500 ml-auto">
          Showing <strong className="text-slate-900">{totalCount}</strong>{' '}
          {totalCount === 1 ? 'activity' : 'activities'}
        </div>
      </div>
    </div>
  );
}
