"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Code2, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { createClient } from "@/lib/supabase/auth-client";

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

type ProjectItem = {
  id: string;
  project_name?: string;
  repository_url?: string;
  framework?: string;
  status?: string;
  recommended_host?: string;
  created_at: string;
};

export function RecentlyAnalyzed() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notAuthenticated, setNotAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchRecent = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/analyze/recent");
        if (res.status === 401) {
          if (!cancelled) setNotAuthenticated(true);
        } else if (res.ok && !cancelled) {
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
    };

    fetchRecent();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setNotAuthenticated(true);
        setProjects([]);
      }
    });

    return () => { 
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (notAuthenticated) {
    return null; // Gracefully fail / hide if not authenticated
  }

  if (error) {
    return (
      <section className="px-6 mb-32 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-neutral-200 rounded-3xl text-center shadow-sm">
          <Clock className="w-12 h-12 text-neutral-300 mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Couldn&apos;t load recent projects</h2>
          <p className="text-neutral-500 mb-6 max-w-md">
            We encountered a problem loading your recently analyzed projects.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold rounded-xl transition-all"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Handle empty state gracefully
  if (!loading && projects.length === 0) {
    return (
      <section className="px-6 mb-32 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-neutral-200 rounded-3xl text-center shadow-sm">
          <Clock className="w-12 h-12 text-neutral-300 mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No analyses yet</h2>
          <p className="text-neutral-500 mb-6 max-w-md">
            You haven&apos;t analyzed any projects yet. Discover the best hosting for your codebase today.
          </p>
          <Link href="/analyze">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
              Analyze your first project
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 mb-32 max-w-6xl mx-auto">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3 text-neutral-900">
              <Clock className="w-8 h-8 text-blue-600" />
              My Recent Projects
            </h2>
            <p className="text-neutral-500 text-lg">
              Review your recent project compatibility analyses.
            </p>
          </div>
          <Link href="/analyze">
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group">
              Analyze New Project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 p-5 rounded-2xl h-[180px] animate-pulse flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-1/2 h-5 bg-neutral-100 rounded-md mb-3" />
                <div className="w-3/4 h-4 bg-neutral-100 rounded-md mb-2" />
                <div className="w-1/3 h-4 bg-neutral-100 rounded-md" />
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="w-16 h-6 bg-neutral-100 rounded-full" />
                <div className="w-24 h-4 bg-neutral-100 rounded-md" />
              </div>
            </div>
          ))
        ) : (
          // Real Data
          projects.map((item, i) => {
            return (
              <ScrollReveal key={item.id} delay={i * 50}>
                <Link href={`/results/${item.id}`}>
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 hover:border-blue-300 transition-all flex flex-col h-full group hover:bg-neutral-50 shadow-sm hover:shadow-md">
                    <div className="flex-grow mb-4">
                      <h3 className="font-bold text-neutral-900 text-lg tracking-tight mb-1 truncate group-hover:text-blue-700 transition-colors">
                        {item.project_name || "Unknown Project"}
                      </h3>
                      <p className="text-xs text-neutral-500 font-mono truncate">
                        {item.repository_url?.replace("https://github.com/", "") || item.id.substring(0, 15)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {item.framework && (
                          <span className="px-2 py-1 rounded-md bg-neutral-100 text-xs text-neutral-700 font-medium flex items-center gap-1.5 border border-neutral-200">
                            <Code2 className="w-3 h-3" />
                            {item.framework}
                          </span>
                        )}
                        {item.status === "completed" ? (
                          <span className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border bg-green-50 text-green-700 border-green-200">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border bg-amber-50 text-amber-700 border-amber-200">
                            {item.status || "Pending"}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-200 pt-3 mt-1">
                        <span className="text-neutral-500">
                          {item.recommended_host ? `Recommended: ${item.recommended_host}` : "Analyzing..."}
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
