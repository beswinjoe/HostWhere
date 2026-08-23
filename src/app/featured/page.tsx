"use client";

import Link from "next/link";
import {
  Zap,
  Star,
  Crown,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { FEATURED_PLANS } from "@/lib/featured/types";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export default function FeaturedPromotionPage() {
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

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Boost Plan */}
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
                {FEATURED_PLANS.boost.description}
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-neutral-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-neutral-400" /> Priority Level {FEATURED_PLANS.boost.priority}
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-neutral-400" /> Appears on Leaderboard
                </li>
              </ul>
              <Link href="/analyze" className="mt-auto">
                <button className="w-full py-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-900 font-bold transition-all group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200">
                  Select {FEATURED_PLANS.boost.name}
                </button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Featured Plan */}
          <ScrollReveal delay={200}>
            <div className="bg-white p-8 rounded-3xl relative h-full flex flex-col border-2 border-amber-400 shadow-md transform md:-translate-y-4 transition-transform hover:-translate-y-5">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
                Most Popular
              </span>
              <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-transparent pointer-events-none rounded-3xl" />
              
              <div className="mb-6 flex items-center gap-3 text-amber-500 relative z-10">
                <Star className="w-8 h-8 fill-amber-500" />
                <h3 className="text-2xl font-bold text-neutral-900">{FEATURED_PLANS.featured.name}</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-6 text-neutral-900 relative z-10">
                <span className="text-4xl font-extrabold">${FEATURED_PLANS.featured.priceCents / 100}</span>
                <span className="text-neutral-500 uppercase font-bold tracking-wider text-sm">/ {FEATURED_PLANS.featured.durationDays} Days</span>
              </div>
              <p className="text-neutral-600 mb-8 flex-grow relative z-10">
                {FEATURED_PLANS.featured.description}
              </p>
              <ul className="space-y-4 mb-8 relative z-10">
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" /> Priority Level {FEATURED_PLANS.featured.priority}
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" /> Higher Leaderboard Ranking
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" /> Homepage Eligible
                </li>
              </ul>
              <Link href="/analyze" className="mt-auto relative z-10">
                <button className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-sm">
                  Select {FEATURED_PLANS.featured.name}
                </button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Spotlight Plan */}
          <ScrollReveal delay={300}>
            <div className="bg-white p-8 rounded-3xl relative h-full flex flex-col border border-purple-200 hover:border-purple-300 transition-all shadow-sm group hover:-translate-y-1">
              <div className="mb-6 flex items-center gap-3 text-purple-600">
                <Crown className="w-8 h-8 fill-purple-600" />
                <h3 className="text-2xl font-bold text-neutral-900">{FEATURED_PLANS.spotlight.name}</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-6 text-neutral-900">
                <span className="text-4xl font-extrabold">${FEATURED_PLANS.spotlight.priceCents / 100}</span>
                <span className="text-neutral-500 uppercase font-bold tracking-wider text-sm">/ {FEATURED_PLANS.spotlight.durationDays} Days</span>
              </div>
              <p className="text-neutral-600 mb-8 flex-grow">
                {FEATURED_PLANS.spotlight.description}
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" /> Priority Level {FEATURED_PLANS.spotlight.priority} (Max)
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" /> Top Leaderboard Ranking
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" /> Priority Homepage Placement
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
