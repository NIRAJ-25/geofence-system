import Link from 'next/link';
import {
  Radio,
  MapPin,
  Shield,
  Activity,
  History,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Compass,
  Zap,
  CameraOff,
  AlertTriangle,
  ShoppingBag,
  HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">GeoFence</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-indigo-400">
                System
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <Link href="/amenities" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Amenities & Stores
            </Link>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#tech" className="hover:text-white transition-colors">
              Tech Stack
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/amenities">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-slate-300 hover:text-white text-xs">
                Directory
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs">
                Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 border-b border-slate-800">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#6366f1 1px, #020617 1px)`,
            backgroundSize: `40px 40px`,
            backgroundPosition: `0 0, 20px 20px`
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-medium text-indigo-300 mb-6 backdrop-blur-xs">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>Academic & Industrial Geolocation System</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Smart Geofencing.{' '}
            <span className="bg-linear-to-r from-indigo-400 via-sky-300 to-indigo-200 bg-clip-text text-transparent">
              Real-Time Location Awareness.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            Create virtual boundaries, monitor location activity, and understand movement through an
            intelligent web-based geofencing system.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-base px-8 h-12 shadow-lg shadow-indigo-600/25">
                Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/help" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-200 hover:bg-slate-800 text-base px-8 h-12">
                Learn How It Works
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs">
            <div>
              <div className="text-2xl font-bold text-white">Haversine</div>
              <div className="text-xs text-slate-400">Spherical Math Engine</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">Zero Leak</div>
              <div className="text-xs text-slate-400">Local-First Storage</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">ENTER / EXIT</div>
              <div className="text-xs text-slate-400">Transition Detection</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">OpenStreetMap</div>
              <div className="text-xs text-slate-400">Leaflet Interactive Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How Geofencing Works */}
      <section id="how-it-works" className="py-20 border-b border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
              Operational Pipeline
            </h2>
            <h3 className="text-3xl font-bold mt-2 text-white">How Geofencing Works</h3>
            <p className="mt-3 text-slate-400 text-sm">
              The system operates completely inside the browser using secure HTML5 Geolocation and spherical trigonometric distance formulas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-900/80 border-slate-800 text-slate-200">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-950 text-indigo-400 mb-4 border border-indigo-800/50">
                  <span className="font-bold">1</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Define Virtual Perimeter</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Set target coordinates and a custom circular radius (from 50m to custom kilometers) on the interactive map canvas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 text-slate-200">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-950 text-indigo-400 mb-4 border border-indigo-800/50">
                  <span className="font-bold">2</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Continuous Distance Math</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Browser watchPosition provides live latitude, longitude, and accuracy. The Haversine algorithm continuously measures distance to center.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 text-slate-200">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-950 text-indigo-400 mb-4 border border-indigo-800/50">
                  <span className="font-bold">3</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Event Trigger & Analytics</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon crossing the boundary (inside vs outside), ENTER or EXIT notifications fire with anti-jitter debouncing and audit logs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Core Features */}
      <section id="features" className="py-20 border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
              Core Capabilities
            </h2>
            <h3 className="text-3xl font-bold mt-2 text-white">Engineered for Precision & Speed</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: 'Dynamic Virtual Fencing',
                desc: 'Create, edit, toggle, and delete multi-radius zones with custom color tags.'
              },
              {
                icon: Activity,
                title: 'Real-Time Movement Engine',
                desc: 'Sub-second distance tracking with GPS accuracy metrics and noise tolerance.'
              },
              {
                icon: History,
                title: 'Event History & Audits',
                desc: 'Chronological timeline of ENTER, EXIT, and DWELL records with distance snapshots.'
              },
              {
                icon: BarChart3,
                title: 'Geospatial Analytics',
                desc: 'Actionable charts displaying trigger frequencies, today events, and dwell duration.'
              },
              {
                icon: Shield,
                title: 'Local-First Architecture',
                desc: 'Full repository pattern ready for IndexedDB and future Firebase cloud sync.'
              },
              {
                icon: Cpu,
                title: 'Modular 21st.dev Design',
                desc: 'Decoupled presentation layer for instant UI redesigns without touching logic.'
              }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-slate-700"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-indigo-950 p-2.5 text-indigo-400 border border-indigo-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1.5">{f.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Breakthrough Features Showcase */}
      <section className="py-20 border-b border-slate-800 bg-linear-to-b from-slate-950 via-indigo-950/20 to-slate-950">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-3">
              <Zap className="h-3.5 w-3.5" />
              <span>Real-World Breakthroughs</span>
            </div>
            <h3 className="text-3xl font-extrabold text-white">
              Pioneering Security, Incident & Civic Discovery
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Beyond simple dots on a map: active hardware lockdown, live traffic detour intelligence, and mannerly community discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Hardware Security Lockdown */}
            <div className="rounded-2xl border border-rose-900/50 bg-slate-900/80 p-6 flex flex-col justify-between hover:border-rose-700/80 transition-all">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60 mb-5">
                  <CameraOff className="h-6 w-6" />
                </div>
                <span className="rounded bg-rose-950 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                  Hardware Security Guard
                </span>
                <h4 className="text-lg font-bold text-white mt-2 mb-2">
                  Automatic Camera & Mic Revocation
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enters museums, examination halls, and defense sites and instantly revokes smartphone camera and microphone access. Upon perimeter exit, locks automatically disengage.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link href="/dashboard" className="text-xs font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1">
                  Test Museum Simulation →
                </Link>
              </div>
            </div>

            {/* 2. Real-Time Incident Detours */}
            <div className="rounded-2xl border border-amber-900/50 bg-slate-900/80 p-6 flex flex-col justify-between hover:border-amber-700/80 transition-all">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/60 mb-5">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <span className="rounded bg-amber-950 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  Highway Incident Advisory
                </span>
                <h4 className="text-lg font-bold text-white mt-2 mb-2">
                  Traffic Collisions & Alternate Routes
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Identifies vehicle pileups and road gridlock as soon as you enter the bottleneck perimeter, proactively streaming news updates and calculating detour paths to bypass hurdles.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link href="/dashboard" className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
                  Test Expressway Simulation →
                </Link>
              </div>
            </div>

            {/* 3. Mannerly Civic Directory & Variety Stores */}
            <div className="rounded-2xl border border-indigo-900/50 bg-slate-900/80 p-6 flex flex-col justify-between hover:border-indigo-700/80 transition-all">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 mb-5">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <span className="rounded bg-indigo-950 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                  Civic POI Discovery
                </span>
                <h4 className="text-lg font-bold text-white mt-2 mb-2">
                  Mannerly Amenities & Variety Stores
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Discover hotels, cafes, hospitals, gas/EV plazas, malls, theatres, and 12 distinct varieties of stores (supermarkets, tech, pharmacies, fashion, books) coupled with civic visitor etiquette codes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link href="/amenities" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                  Explore Amenities Directory →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Privacy & Security */}
      <section id="privacy" className="py-20 border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Honest Browser Geolocation & Privacy</h3>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6">
            We are technically honest: web browsers do not support background location tracking when the tab
            is closed. All monitoring happens client-side while the app is active, and coordinates are stored
            strictly on your local device.
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-800/80 px-4 py-2 text-xs text-slate-300 border border-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Zero Remote Telemetry in Default Local Mode</span>
          </div>
        </div>
      </section>

      {/* 5. Technology Stack */}
      <section id="tech" className="py-16 border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Production Tech Stack
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              'Next.js 16',
              'React 19',
              'TypeScript',
              'Tailwind CSS v4',
              'OpenStreetMap & Leaflet',
              'Overpass API',
              'Lucide Icons',
              'IndexedDB / Repository Pattern',
              'Vercel Deployment'
            ].map((t) => (
              <span
                key={t}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row text-xs text-slate-500">
          <div>GeoFence — Smart Location & Geofencing System © 2026. Academic Project.</div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-slate-300">
              Dashboard
            </Link>
            <Link href="/settings" className="hover:text-slate-300">
              Settings
            </Link>
            <Link href="/help" className="hover:text-slate-300">
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
