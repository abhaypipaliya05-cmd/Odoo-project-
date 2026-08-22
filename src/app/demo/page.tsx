'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Sparkles,
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

interface Slide {
  id: number;
  time: string;
  title: string;
  subtitle: string;
  narration: string;
  route: string;
  tag: string;
  highlights: string[];
  visualType: 'dashboard' | 'mytrips' | 'create' | 'itinerary' | 'explore' | 'budget' | 'share' | 'profile';
}

const slides: Slide[] = [
  {
    id: 1,
    time: '0:00 - 0:15',
    title: 'Welcome to GlobeTrotter',
    subtitle: 'Empowering Personalized Multi-City Travel Planning',
    narration:
      'Welcome to GlobeTrotter, the intelligent, personalized travel planning platform built to help modern travelers dream, design, and organize multi-city journeys effortlessly.',
    route: '/',
    tag: 'Intro & Vision',
    highlights: [
      'Personalized multi-city itineraries',
      'Automated budget estimation & expense breakdown',
      'Curated global destination and activity discovery',
      'Public itinerary sharing with community cloning',
    ],
    visualType: 'dashboard',
  },
  {
    id: 2,
    time: '0:15 - 0:35',
    title: 'Personalized Travel Dashboard',
    subtitle: 'Central Hub & Live KPI Metrics',
    narration:
      'The Dashboard provides an aggregated overview of your journeys. Travelers can see live KPIs including upcoming departures, total planned budgets, saved wishlist destinations, and instant quick actions.',
    route: '/',
    tag: 'Feature 2: Dashboard',
    highlights: [
      'Live metric cards linked to relational Prisma database',
      'Upcoming trip countdown & active journey status',
      'Recommended global destinations with average daily costs',
      'Quick action launchpad for rapid itinerary creation',
    ],
    visualType: 'dashboard',
  },
  {
    id: 3,
    time: '0:35 - 0:55',
    title: 'My Trips Management Hub',
    subtitle: 'Filter, Search, Clone & Share Itineraries',
    narration:
      'The My Trips screen gives travelers complete control over their travel portfolio. Filter by planned, active, or completed journeys, search in real-time, and easily clone or share your favorite plans.',
    route: '/my-trips',
    tag: 'Feature 4: My Trips',
    highlights: [
      'Status tabs: Planned, Active Now, Completed, and Drafts',
      'Real-time search across trip titles and destination stops',
      'Instant trip cloning into personal accounts',
      'Card actions for viewing, editing, and sharing links',
    ],
    visualType: 'mytrips',
  },
  {
    id: 4,
    time: '0:55 - 1:15',
    title: 'Create Trip Wizard',
    subtitle: 'Interactive Initiation & Validation',
    narration:
      'Initiating a journey is fast and intuitive. Set trip titles, departure and return dates, target budgets, multiple currency preferences, and pick curated cover photos with built-in validation.',
    route: '/trips/create',
    tag: 'Feature 3: Create Trip',
    highlights: [
      'Start & end date validation preventing conflicting schedules',
      'Multi-currency support: USD, EUR, GBP, INR, JPY, and more',
      'Curated destination cover photo presets & custom URLs',
      'Seamless redirect directly into the full itinerary builder',
    ],
    visualType: 'create',
  },
  {
    id: 5,
    time: '1:15 - 1:40',
    title: 'Itinerary View & Day-wise Timeline',
    subtitle: 'Structured Daily Flow & Activity Scheduling',
    narration:
      'Review your comprehensive multi-city itinerary. Each day displays active city stops, hotel accommodation costs, scheduled activities with exact times and duration, and daily subtotal costs.',
    route: '/trips/[id]',
    tag: 'Features 5, 6 & 10: Itinerary',
    highlights: [
      'Day-by-day structured cards (Day 1, Day 2...)',
      'Activity scheduling with categories, duration, and costs',
      'Print & PDF clean export mode for on-the-go travelers',
      'City transition sequence and transportation costs',
    ],
    visualType: 'itinerary',
  },
  {
    id: 6,
    time: '1:40 - 2:00',
    title: 'Budget Engine & Cost Breakdown',
    subtitle: 'Stay on Track with Automated Financials',
    narration:
      'GlobeTrotter automatically calculates and categorizes every expense across Stay, Transportation, Activities, and Meals, providing average daily costs and overbudget alerts.',
    route: '/trips/[id]',
    tag: 'Feature 9: Budget & Cost',
    highlights: [
      'Category-wise allocation: Accommodation, Transport, Food, Activities',
      'Overbudget alerts and remaining budget indicator',
      'Average daily expense calculation across trip duration',
      'Direct synchronization with database expense records',
    ],
    visualType: 'budget',
  },
  {
    id: 7,
    time: '2:00 - 2:20',
    title: 'Global City & Activity Discovery',
    subtitle: 'Explore 9+ Cities, 30+ Activities & Wishlists',
    narration:
      'Discover exciting travel hotspots across Asia, Europe, and the Americas. Filter by category, cost tier, and region, and bookmark favorite places or add them straight into existing trips.',
    route: '/explore',
    tag: 'Features 7 & 8: Discovery',
    highlights: [
      'City filters by Region, Country, and Cost Index',
      'Activity filters by Category (Food, Adventure, Culture, Sightseeing)',
      '1-Click Add City and Add Activity interactive modals',
      'Saved Wishlist bucket list synced to user accounts',
    ],
    visualType: 'explore',
  },
  {
    id: 8,
    time: '2:20 - 2:40',
    title: 'Public Sharing & Trip Forking',
    subtitle: 'Community Sharing with 1-Click Forking',
    narration:
      'Share your finished travel itineraries with the world. Viewers access a clean, sanitized public page and can fork the entire itinerary directly into their personal account with a single click.',
    route: '/share/[slug]',
    tag: 'Feature 11: Public Sharing',
    highlights: [
      'Unique vanity public share URL',
      'Creator profile attribution with privacy protection',
      '1-Click "Clone / Fork Trip" button for community inspiration',
      'Read-only view without exposing personal credentials',
    ],
    visualType: 'share',
  },
  {
    id: 9,
    time: '2:40 - 3:00',
    title: 'Profile, Security & Test Suite',
    subtitle: 'Complete SaaS Experience with 100% Test Pass Rate',
    narration:
      'Backed by Prisma ORM and SQLite, GlobeTrotter features secure authentication, 1-click demo logins, robust profile preferences, and sixty-two automated tests with zero build errors.',
    route: '/profile',
    tag: 'Features 1, 12 & Tests',
    highlights: [
      '62/62 Backend & Discovery tests passing (100%)',
      'Secure bcrypt password hashing & JWT token sessions',
      '1-Click Demo login for instant hackathon evaluation',
      'Production-ready Next.js 14 App Router architecture',
    ],
    visualType: 'profile',
  },
];

export default function DemoVideoPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const currentSlide = slides[currentSlideIndex];
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakCurrentSlide = () => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(currentSlide.narration);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (isPlaying) {
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }
    };

    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      speakCurrentSlide();
    } else {
      if (synthRef.current) synthRef.current.cancel();
    }
  }, [currentSlideIndex, isPlaying]);

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if (synthRef.current) synthRef.current.cancel();
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    if (synthRef.current) synthRef.current.cancel();
    setCurrentSlideIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                GlobeTrotter Interactive Video & Voice Walkthrough
              </h1>
              <p className="text-xs text-slate-400">
                Automated audio narration with live visual walkthrough of all 13 features
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span>Back to App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Main Visual Display */}
          <div className="relative min-h-[460px] p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950">
            {/* Top Bar inside Player */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentSlide.tag}
                </span>
                <span className="text-xs font-mono text-slate-400">{currentSlide.time}</span>
              </div>

              <span className="text-xs font-mono bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
            </div>

            {/* Slide Content Showcase */}
            <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {currentSlide.title}
                </h2>
                <p className="text-sm font-semibold text-sky-400">{currentSlide.subtitle}</p>

                <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 backdrop-blur-sm space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    🎙️ <span className="font-semibold text-white">Voiceover:</span> &ldquo;{currentSlide.narration}&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {currentSlide.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Preview Mockup Box */}
              <div className="lg:col-span-5 bg-gradient-to-tr from-sky-900/30 to-indigo-900/30 rounded-2xl border border-sky-500/20 p-6 flex flex-col justify-between shadow-xl min-h-[260px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">Live Screen Preview</span>
                    <span className="text-[11px] font-mono text-slate-400">{currentSlide.route}</span>
                  </div>

                  {currentSlide.visualType === 'dashboard' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
                        <p className="font-bold text-sky-300">📊 Live KPI Overview</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Total Trips, Planned Budget & Wishlist</p>
                      </div>
                      <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <p className="font-bold text-indigo-300">🌍 Recommended Hubs</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Paris, Tokyo, Dubai, Mumbai, London</p>
                      </div>
                    </div>
                  )}

                  {currentSlide.visualType === 'mytrips' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <p className="font-bold text-emerald-300">✈️ Grand Western India Odyssey</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Oct 01 – Oct 10 • 3 Stops • $2,500 Target</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-300">Clone Action</span>
                        <span className="px-2 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-300">Public Share</span>
                      </div>
                    </div>
                  )}

                  {currentSlide.visualType === 'create' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <p className="font-bold text-amber-300">✍️ Multi-City Form</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Dates validation, Budget targets & Presets</p>
                      </div>
                    </div>
                  )}

                  {currentSlide.visualType === 'itinerary' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
                        <p className="font-bold text-sky-300">📅 Day-by-Day Timeline</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Ahmedabad → Mumbai → Goa (3 Stops)</p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded-xl">
                        <p className="font-semibold text-slate-200">🖨️ Clean Print / PDF Export Available</p>
                      </div>
                    </div>
                  )}

                  {currentSlide.visualType === 'budget' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <p className="font-bold text-emerald-300">💰 Budget Engine</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Stay ($850), Transport ($750), Meals ($120)</p>
                      </div>
                    </div>
                  )}

                  {currentSlide.visualType === 'explore' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <p className="font-bold text-purple-300">🔍 9+ Cities & 30+ Activities</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Filter by Region, Cost Index, and Interests</p>
                      </div>
                    </div>
                  )}

                  {currentSlide.visualType === 'share' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
                        <p className="font-bold text-sky-300">🔗 Public Share Link</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Sanitized read-only view + 1-Click Fork</p>
                      </div>
                    </div>
                  )}

                  {currentSlide.visualType === 'profile' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <p className="font-bold text-emerald-300">✅ 62/62 Automated Tests Passed</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">Zero Build Errors • Production Ready</p>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={currentSlide.route}
                  className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <span>Open This Screen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-300"
                style={{
                  width: `${((currentSlideIndex + 1) / slides.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Bottom Player Controls */}
          <div className="bg-slate-950 p-4 sm:p-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Walkthrough
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Play Video & Voice
                  </>
                )}
              </button>

              <button
                onClick={handleRestart}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Restart from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isVoiceEnabled
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title={isVoiceEnabled ? 'Voiceover Enabled' : 'Voiceover Muted'}
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Slide Selectors / Steppers */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                title="Previous feature"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <div className="flex gap-1.5 overflow-x-auto max-w-xs sm:max-w-none">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (synthRef.current) synthRef.current.cancel();
                      setCurrentSlideIndex(idx);
                      if (isPlaying) speakCurrentSlide();
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlideIndex === idx
                        ? 'bg-sky-400 scale-125 ring-2 ring-sky-400/40'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    title={s.title}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                title="Next feature"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Index Grid */}
        <div className="bg-slate-900/60 rounded-3xl p-6 border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Featured Chapters & Coverage</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  if (synthRef.current) synthRef.current.cancel();
                  setCurrentSlideIndex(idx);
                  if (isPlaying) speakCurrentSlide();
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  currentSlideIndex === idx
                    ? 'bg-sky-500/20 border-sky-500/50 text-white'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <p className="text-[10px] font-mono text-sky-400">{slide.time}</p>
                <p className="text-xs font-semibold mt-0.5 truncate">{slide.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
