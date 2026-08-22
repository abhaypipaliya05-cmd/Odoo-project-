import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-teal-50 to-slate-100">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 border border-teal-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl shadow">
            🌍
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              GlobeTrotter
            </h1>
            <p className="text-teal-700 font-medium text-sm">
              Empowering Personalized Travel Planning • Backend Foundation Active
            </p>
          </div>
        </div>

        <p className="text-slate-600 mb-6 leading-relaxed">
          Welcome to the GlobeTrotter Backend & API Platform. The backend services,
          relational database, authentication, multi-city itinerary logic, automated budget engine,
          and public sharing are fully operational.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <span className="text-emerald-500">●</span> Backend Status
            </h3>
            <p className="text-xs text-slate-500">
              Prisma ORM • PostgreSQL/SQLite Ready • JWT Sessions • Zod Validation
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <span className="text-teal-500">●</span> Seed Dataset
            </h3>
            <p className="text-xs text-slate-500">
              Ahmedabad, Mumbai, Delhi, Jaipur, Goa, Dubai, Paris, Tokyo, London
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            Core Backend API Contracts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-700">
            <span className="bg-slate-100 p-2 rounded">POST /api/auth/signup</span>
            <span className="bg-slate-100 p-2 rounded">POST /api/auth/login</span>
            <span className="bg-slate-100 p-2 rounded">GET /api/auth/me</span>
            <span className="bg-slate-100 p-2 rounded">GET /api/trips</span>
            <span className="bg-slate-100 p-2 rounded">POST /api/trips</span>
            <span className="bg-slate-100 p-2 rounded">GET /api/trips/[id]</span>
            <span className="bg-slate-100 p-2 rounded">GET /api/trips/[id]/budget</span>
            <span className="bg-slate-100 p-2 rounded">GET /api/trips/[id]/timeline</span>
            <span className="bg-slate-100 p-2 rounded">POST /api/trips/[id]/clone</span>
            <span className="bg-slate-100 p-2 rounded">GET /api/cities</span>
            <span className="bg-slate-100 p-2 rounded">GET /api/activities</span>
            <span className="bg-slate-100 p-2 rounded">GET /api/saved-destinations</span>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Odoo Hackathon 2026 • Tech Lead: Yaksh</span>
          <span>Documentation in /docs/API.md</span>
        </div>
      </div>
    </main>
  );
}
