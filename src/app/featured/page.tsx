"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Sparkles,
  Loader2,
  ArrowRight,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { LeaderboardCard } from "@/components/featured/LeaderboardCard";
import { ActivityFeed } from "@/components/featured/ActivityFeed";
import type { FeaturedProjectWithRank } from "@/lib/featured/types";

export default function FeaturedPage() {
  const [projects, setProjects] = useState<FeaturedProjectWithRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/featured");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden">
      <Navbar />

      {/* Backgrounds */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-amber-500/3 blur-[100px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-28 pb-24 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 hero-animate">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 backdrop-blur-md mb-6">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-medium tracking-wide uppercase text-amber-300">
              Featured Projects Leaderboard
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,5vw,5rem)] font-extrabold tracking-[-0.04em] leading-[0.95] mb-4">
            Projects worth{" "}
            <span className="gradient-text">discovering.</span>
          </h1>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light mb-8">
            The most promoted open-source projects on HostWhere. Bid to feature
            your analyzed project and climb the leaderboard.
          </p>

          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-full font-semibold transition-all cta-glow"
          >
            <Star className="w-4 h-4" />
            Analyze & Feature Your Project
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-neutral-400 font-medium">
                Loading leaderboard...
              </p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="max-w-lg mx-auto">
            <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">
                  No featured projects yet
                </h2>
                <p className="text-neutral-400 mb-8 leading-relaxed">
                  Be the first to feature your project! Analyze a GitHub
                  repository and bid to appear on the leaderboard.
                </p>
                <Link href="/analyze">
                  <button className="cta-glow flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-bold text-lg transition-all mx-auto">
                    <Star className="w-5 h-5" />
                    Feature a Project
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Leaderboard Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Cards */}
            <div className="lg:col-span-2 space-y-4">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="animate-slide-up"
                  style={{
                    animationDelay: `${index * 80}ms`,
                    opacity: 0,
                  }}
                >
                  <LeaderboardCard project={project} />
                </div>
              ))}
            </div>

            {/* Activity Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20">
                <ActivityFeed />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} HostWhere — Free and open-source
            project analyzer.
          </p>
        </div>
      </footer>
    </div>
  );
}
