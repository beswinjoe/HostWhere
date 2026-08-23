"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Star, Crown, Clock, Code2, ArrowRight } from "lucide-react";
import { FEATURED_PLANS, type PlanType, FeaturedProjectWithRank } from "@/lib/featured/types";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export function HomepageFeaturedProjects() {
  const [projects, setProjects] = useState<FeaturedProjectWithRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProjects() {
      try {
        const res = await fetch("/api/featured");
        if (res.ok && !cancelled) {
          const data = await res.json();
          // Only show top 3 on homepage
          setProjects((data.projects || []).slice(0, 3));
        } else if (!res.ok) {
          if (!cancelled) setError(true);
        }
      } catch (err) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProjects();
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
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
              Featured Projects
            </h2>
            <p className="text-neutral-400 text-lg">
              Top community projects currently getting noticed.
            </p>
          </div>
          <Link href="/featured">
            <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors group">
              View Full Leaderboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-3 gap-6">
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass p-6 rounded-2xl h-[240px] animate-pulse">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-full" />
                <div className="w-20 h-6 bg-white/5 rounded-md" />
              </div>
              <div className="w-3/4 h-6 bg-white/5 rounded-md mb-3" />
              <div className="w-1/2 h-4 bg-white/5 rounded-md mb-8" />
              <div className="w-full h-10 bg-white/5 rounded-full" />
            </div>
          ))
        ) : (
          // Real Data
          projects.map((project, index) => {
            const planConfig = project.plan ? FEATURED_PLANS[project.plan as PlanType] : FEATURED_PLANS.boost;
            
            let BadgeIcon = Zap;
            let badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            let borderColor = "border-emerald-500/20 hover:border-emerald-500/40";
            let gradientColor = "emerald";
            
            if (planConfig?.id === "spotlight") {
              BadgeIcon = Crown;
              badgeColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
              borderColor = "border-cyan-500/20 hover:border-cyan-500/40";
              gradientColor = "cyan";
            } else if (planConfig?.id === "featured") {
              BadgeIcon = Star;
              badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
              borderColor = "border-amber-500/20 hover:border-amber-500/40";
              gradientColor = "amber";
            }
            
            const expiresAt = project.expires_at ? new Date(project.expires_at) : null;
            const daysRemaining = expiresAt 
              ? Math.max(0, Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
              : 0;

            return (
              <ScrollReveal key={project.id} delay={index * 100}>
                <div className={`glass p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full relative overflow-hidden group hover:scale-[1.02] ${borderColor}`}>
                  <div className={`absolute inset-0 bg-gradient-to-b from-${gradientColor}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold uppercase tracking-wider ${badgeColor}`}>
                      <BadgeIcon className="w-4 h-4" />
                      {planConfig?.name || "Featured"}
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {daysRemaining}d left
                    </div>
                  </div>

                  <div className="relative z-10 mb-6 flex-grow">
                    <h3 className="font-bold text-xl text-white tracking-tight mb-2 truncate">
                      {project.project_name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-neutral-300 font-medium flex items-center gap-1.5 border border-white/5">
                        <Code2 className="w-3 h-3" />
                        {project.framework}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <Link href={`/results/${project.analysis_result_id || `github-${project.repository_url.replace("https://github.com/", "").replace("/", "-")}`}`}>
                      <button className={`w-full py-2.5 rounded-xl bg-white/5 hover:bg-${gradientColor}-500 hover:text-black border border-white/10 text-sm font-medium transition-all group-hover:shadow-[0_0_20px_rgba(var(--color-${gradientColor}-500),0.2)]`}>
                        View Project
                      </button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })
        )}
      </div>
    </section>
  );
}
