"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Star,
  Crown,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
  Globe,
  UserCircle,
  Layers,
  Share2,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { FEATURED_PLANS, type FeaturedProjectWithRank } from "@/lib/featured/types";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { LeaderboardCard } from "@/components/featured/LeaderboardCard";

export default function FeaturedPromotionPage() {
  const [projects, setProjects] = useState<FeaturedProjectWithRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/featured");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProjects(data.projects || []);
        } else if (!res.ok && !cancelled) {
          setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-blue-100 relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Backgrounds */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-100" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 flex-1 pt-32 pb-24 px-6 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-16 hero-animate">
          <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold text-neutral-900 tracking-[-0.04em] leading-[0.95] mb-6">
            Get your project <span className="text-blue-600">noticed.</span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light mb-10">
            Promote your project to the HostWhere community and appear on the Featured Projects leaderboard.
          </p>

          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-full font-bold transition-all cta-glow text-lg"
          >
            <Star className="w-5 h-5" />
            Analyze a Project to Feature
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* LIVE FEATURED PROJECTS — LEADERBOARD                   */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="mb-24" id="leaderboard">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-neutral-900 flex items-center gap-3 mb-2">
              <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
              Live Featured Projects
            </h2>
            <p className="text-neutral-500 text-base">
              Discover projects currently promoted on HostWhere.
            </p>
          </div>

          {loading ? (
            /* Loading skeleton */
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 animate-pulse shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-neutral-100 rounded-xl shrink-0" />
                    <div className="flex-1">
                      <div className="w-1/3 h-5 bg-neutral-100 rounded-md mb-2" />
                      <div className="w-1/2 h-4 bg-neutral-100 rounded-md mb-4" />
                      <div className="flex gap-2">
                        <div className="w-20 h-6 bg-neutral-100 rounded-lg" />
                        <div className="w-16 h-6 bg-neutral-100 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-neutral-200 rounded-3xl shadow-sm">
              <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
              <p className="text-neutral-700 font-bold mb-2">Failed to load leaderboard</p>
              <p className="text-neutral-500 text-sm mb-4">Something went wrong fetching the featured projects.</p>
              <button 
                onClick={handleRetry}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-neutral-200 rounded-3xl shadow-sm text-center px-6">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                <Crown className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-xl font-bold text-neutral-900 mb-2">No featured projects yet</p>
              <p className="text-neutral-500 mb-6 max-w-sm">
                Be the first to promote your project and claim the top spot.
              </p>
              <Link href="/analyze">
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-sm text-sm">
                  Feature your project
                </button>
              </Link>
            </div>
          ) : (
            /* Leaderboard cards */
            <div className="flex flex-col gap-4">
              {projects.map((project, idx) => (
                <ScrollReveal key={project.id} delay={idx * 50}>
                  <LeaderboardCard project={project} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PRICING PLANS                                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-3">Choose a Plan</h2>
            <p className="text-neutral-500 text-lg max-w-lg mx-auto">Pick the visibility tier that fits your project.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* ── Boost Plan ────────────────────────────────── */}
            <ScrollReveal delay={100}>
              <div className="bg-white p-8 rounded-3xl relative h-full flex flex-col border border-neutral-200 hover:border-blue-300 transition-all shadow-sm group hover:-translate-y-1">
                <div className="mb-6 flex items-center gap-3 text-blue-600">
                  <Zap className="w-8 h-8" />
                  <h3 className="text-2xl font-bold text-neutral-900">{FEATURED_PLANS.boost.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6 text-neutral-900">
                  <span className="text-4xl font-extrabold">${FEATURED_PLANS.boost.priceCents / 100}</span>
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-sm">/ {FEATURED_PLANS.boost.durationDays} Days</span>
                </div>
                <p className="text-neutral-600 mb-8 flex-grow">
                  Get your project on the leaderboard for 7 days.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-neutral-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> Leaderboard Visibility
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> Priority Level {FEATURED_PLANS.boost.priority}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-400 font-medium">
                    <XCircle className="w-5 h-5 text-neutral-300 shrink-0" /> <span className="line-through">Project Profile Editing</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-400 font-medium">
                    <XCircle className="w-5 h-5 text-neutral-300 shrink-0" /> <span className="line-through">Homepage Placement</span>
                  </li>
                </ul>
                <Link href="/analyze" className="mt-auto">
                  <button className="w-full py-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-900 font-bold transition-all group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200">
                    Select {FEATURED_PLANS.boost.name}
                  </button>
                </Link>
              </div>
            </ScrollReveal>

            {/* ── Featured Plan ─────────────────────────────── */}
            <ScrollReveal delay={200}>
              <div className="bg-white p-8 rounded-3xl relative h-full flex flex-col border-2 border-amber-400 shadow-md transform md:-translate-y-4 transition-transform hover:-translate-y-5">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 shadow-sm featured-badge-glow">
                  Most Popular
                </span>
                <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-transparent pointer-events-none rounded-3xl" />
                
                <div className="mb-6 flex items-center gap-3 text-amber-500 relative z-10">
                  <Star className="w-8 h-8 fill-amber-500 featured-star-glow" />
                  <h3 className="text-2xl font-bold text-neutral-900">{FEATURED_PLANS.featured.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6 text-neutral-900 relative z-10">
                  <span className="text-4xl font-extrabold">${FEATURED_PLANS.featured.priceCents / 100}</span>
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-sm">/ {FEATURED_PLANS.featured.durationDays} Days</span>
                </div>
                <p className="text-neutral-600 mb-8 flex-grow relative z-10">
                  Higher visibility with editable project profile for 14 days.
                </p>
                <ul className="space-y-3 mb-8 relative z-10">
                  <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Higher Leaderboard Ranking
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Homepage Eligible
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Editable Project Profile
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-500 font-medium pl-8">
                    <span className="leading-relaxed">
                      <Globe className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-amber-400" />Website &amp; Demo Links ·
                      <UserCircle className="w-3.5 h-3.5 inline -mt-0.5 mx-1 text-amber-400" />Creator Name ·
                      <Layers className="w-3.5 h-3.5 inline -mt-0.5 mx-1 text-amber-400" />Category ·
                      <Share2 className="w-3.5 h-3.5 inline -mt-0.5 mx-1 text-amber-400" />Social Links
                    </span>
                  </li>
                </ul>
                <Link href="/analyze" className="mt-auto relative z-10">
                  <button className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-sm">
                    Select {FEATURED_PLANS.featured.name}
                  </button>
                </Link>
              </div>
            </ScrollReveal>

            {/* ── Spotlight Plan ────────────────────────────── */}
            <ScrollReveal delay={300}>
              <div className="bg-white p-8 rounded-3xl relative h-full flex flex-col border border-purple-200 hover:border-purple-300 transition-all shadow-sm group hover:-translate-y-1">
                <div className="mb-6 flex items-center gap-3 text-purple-600">
                  <Crown className="w-8 h-8 fill-purple-600 spotlight-crown-glow" />
                  <h3 className="text-2xl font-bold text-neutral-900">{FEATURED_PLANS.spotlight.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6 text-neutral-900">
                  <span className="text-4xl font-extrabold">${FEATURED_PLANS.spotlight.priceCents / 100}</span>
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-sm">/ {FEATURED_PLANS.spotlight.durationDays} Days</span>
                </div>
                <p className="text-neutral-600 mb-8 flex-grow">
                  Premium visibility and top placement for 30 days.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" /> Top Leaderboard Ranking
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" /> Priority Homepage Placement
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" /> Premium Editable Profile
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-500 font-medium pl-8">
                    <span className="leading-relaxed">
                      <Globe className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-purple-400" />Website &amp; Demo Links ·
                      <UserCircle className="w-3.5 h-3.5 inline -mt-0.5 mx-1 text-purple-400" />Creator Name ·
                      <Layers className="w-3.5 h-3.5 inline -mt-0.5 mx-1 text-purple-400" />Category ·
                      <Share2 className="w-3.5 h-3.5 inline -mt-0.5 mx-1 text-purple-400" />Social Links
                    </span>
                  </li>
                </ul>
                <Link href="/analyze" className="mt-auto">
                  <button className="w-full py-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold transition-all group-hover:bg-purple-600 group-hover:text-white">
                    Select {FEATURED_PLANS.spotlight.name}
                  </button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-white p-12 rounded-3xl border border-neutral-200 shadow-sm">
            <h2 className="font-display text-3xl font-bold mb-4 text-neutral-900">Ready to get started?</h2>
            <p className="text-neutral-500 mb-8 max-w-lg mx-auto">Analyze your project first, then choose a promotion plan to start getting noticed.</p>
            <Link href="/analyze">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-sm text-lg">
                Analyze Your Project
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-10 px-6 relative z-10 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-center text-center">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} HostWhere — Free and open-source
            project analyzer.
          </p>
        </div>
      </footer>
    </div>
  );
}
