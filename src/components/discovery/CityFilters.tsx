'use client';

import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Globe2 } from 'lucide-react';

interface CityFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedRegion: string;
  onRegionChange: (val: string) => void;
  selectedCountry: string;
  onCountryChange: (val: string) => void;
  selectedCostIndex: string;
  onCostIndexChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  availableCountries: string[];
  onReset: () => void;
  totalCount: number;
}

const REGIONS = ['All', 'Asia', 'Europe', 'North America', 'Americas', 'Middle East', 'Oceania'];
const COST_TIERS = [
  { label: 'All Costs', value: 'All' },
  { label: 'Budget', value: 'BUDGET' },
  { label: 'Moderate', value: 'MODERATE' },
  { label: 'Luxury', value: 'LUXURY' },
];

export function CityFilters({
  search,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedCountry,
  onCountryChange,
  selectedCostIndex,
  onCostIndexChange,
  sortBy,
  onSortChange,
  availableCountries,
  onReset,
  totalCount,
}: CityFiltersProps) {
  const isFiltered =
    Boolean(search) ||
    selectedRegion !== 'All' ||
    selectedCountry !== 'All' ||
    selectedCostIndex !== 'All' ||
    sortBy !== 'popularity';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Top Search & Sorting Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by city name, country, or landmarks..."
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

        {/* Dropdowns Row: Country & Sort */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Country Selector */}
          <div className="relative min-w-[140px] flex-1 sm:flex-initial">
            <select
              value={selectedCountry}
              onChange={(e) => onCountryChange(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-700 appearance-none pr-8 cursor-pointer"
            >
              <option value="All">All Countries</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Globe2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative min-w-[150px] flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-700 appearance-none pr-8 cursor-pointer"
            >
              <option value="popularity">Popularity (High to Low)</option>
              <option value="cost_asc">Daily Cost (Low to High)</option>
              <option value="cost_desc">Daily Cost (High to Low)</option>
              <option value="name_asc">City Name (A to Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters Button */}
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

      {/* Filter Pills Row: Regions & Cost Tiers */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Region:
          </span>
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => onRegionChange(region)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRegion === region
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Cost Tier Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Cost:
          </span>
          {COST_TIERS.map((tier) => (
            <button
              key={tier.value}
              onClick={() => onCostIndexChange(tier.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCostIndex === tier.value
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing <strong className="text-slate-900">{totalCount}</strong>{' '}
          {totalCount === 1 ? 'city destination' : 'city destinations'}
        </span>
      </div>
    </div>
  );
}
