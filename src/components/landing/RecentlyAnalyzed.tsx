"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Code2, ArrowRight, UserCircle } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

// Helper for relative time
function getRelativeTime(dateString: string) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const time = new Date(dateString).getTime();
  const now = Date.now();
  const diffInSeconds = Math.round((time - now) / 1000);

  const minutes = Math.round(diffInSeconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');

  const days = Math.round(hours / 24);
  return rtf.format(days, 'day');
}

export function RecentlyAnalyzed() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecent() {
      try {
        const res = await fetch("/api/analyze/recent");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProjects(data.projects || []);
        } else if (!res.ok) {
          if (!cancelled) setError(true);
        }
      } catch (err) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecent();
    return () => { cancelled = true; };
  }, []);

  if (error || (!loading && projects.length === 0)) {
    return null; // Gracefully fail / hide if nothing to show
  }

  return (
    <section className="px-6 mb-32 max-w-6xl mx-auto">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              Recently Analyzed
            </h2>
            <p className="text-neutral-400 text-lg">
              See what the community is building and where they are deploying.
            </p>
          </div>
          <Link href="/analyze">
            <button className="flex items-center gap-2 text-primary hover:text-blue-400 font-medium transition-colors group">
              Analyze Your Project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass p-5 rounded-2xl h-[180px] animate-pulse flex flex-col justify-between">
              <div>
                <div className="w-1/2 h-5 bg-white/5 rounded-md mb-3" />
                <div className="w-3/4 h-4 bg-white/5 rounded-md mb-2" />
                <div className="w-1/3 h-4 bg-white/5 rounded-md" />
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="w-16 h-6 bg-white/5 rounded-full" />
                <div className="w-24 h-4 bg-white/5 rounded-md" />
              </div>
            </div>
          ))
        ) : (
          // Real Data
          projects.map((item, i) => {
            const compSummary = item.compatibility_summary || { compatible: 0, possible: 0, incompatible: 0 };
            
            return (
              <ScrollReveal key={item.id} delay={i * 50}>
                <Link href={`/results/${item.analysis_id}`}>
                  <div className="glass p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all flex flex-col h-full group hover:bg-white/[0.04]">
                    <div className="flex-grow mb-4">
                      <h3 className="font-bold text-white text-lg tracking-tight mb-1 truncate group-hover:text-primary transition-colors">
                        {item.project_name}
                      </h3>
                      <p className="text-xs text-neutral-500 font-mono truncate">
                        {item.github_url?.replace("https://github.com/", "") || item.analysis_id.substring(0, 15)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-neutral-300 font-medium flex items-center gap-1.5 border border-white/5">
                          <Code2 className="w-3 h-3" />
                          {item.framework || "unknown"}
                        </span>
                        
                        <span className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border bg-white/5 text-neutral-300 border-white/10">
                           {compSummary.compatible} Compatible
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-white/5 pt-3 mt-1">
                        <span className="flex items-center gap-1.5 text-neutral-400">
                          <UserCircle className="w-3.5 h-3.5" />
                          {item.profiles?.username || "unknown"}
                        </span>
                        <span>{getRelativeTime(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })
        )}
      </div>
    </section>
  );
}
