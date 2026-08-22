import React from 'react';
import Link from 'next/link';
import { Compass, Heart, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800">GlobeTrotter</span>
            <span className="text-xs text-slate-500 ml-2">Empowering Personalized Travel Planning</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-sky-600 transition-colors">Dashboard</Link>
            <Link href="/my-trips" className="hover:text-sky-600 transition-colors">My Trips</Link>
            <Link href="/explore" className="hover:text-sky-600 transition-colors">Explore</Link>
            <Link href="/profile" className="hover:text-sky-600 transition-colors">Profile</Link>
            <a
              href="https://github.com/abhaypipaliya05-cmd/Odoo-project-"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="border-t border-slate-200/60 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} GlobeTrotter. Built for the Hackathon.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by Team GlobeTrotter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
