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
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6 shadow-[0_0_20px_-3px_rgba(251,191,36,0.3)] relative group">
              <div className="absolute inset-0 bg-amber-400 opacity-20 blur-xl rounded-2xl group-hover:opacity-40 transition-opacity"></div>
              <Star className="w-8 h-8 text-amber-500 fill-amber-500 relative z-10" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-3 flex items-center gap-3 text-neutral-900">
              Featured Projects
            </h2>
            <p className="text-neutral-600 text-lg">
              Top community projects currently getting noticed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/featured">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-105 shadow-md text-sm font-bold transition-all">
                Feature Your Project
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid md:grid-cols-3 gap-6">
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 shadow-sm p-6 rounded-2xl h-[240px] animate-pulse">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-full" />
                <div className="w-20 h-6 bg-neutral-100 rounded-md" />
              </div>
              <div className="w-3/4 h-6 bg-neutral-100 rounded-md mb-3" />
              <div className="w-1/2 h-4 bg-neutral-100 rounded-md mb-8" />
              <div className="w-full h-10 bg-neutral-100 rounded-xl" />
            </div>
          ))
        ) : (
          // Real Data
          projects.map((project, index) => {
            const planConfig = project.plan ? FEATURED_PLANS[project.plan as PlanType] : FEATURED_PLANS.boost;
            
            let BadgeIcon = Zap;
            let badgeColor = "text-blue-700 bg-blue-50 border-blue-200";
            let borderColor = "border-neutral-200 hover:border-blue-400";
            let shadowGlow = "hover:shadow-[0_0_20px_-3px_rgba(59,130,246,0.3)]";
            let gradientColor = "blue";
            
            if (planConfig?.id === "spotlight") {
              BadgeIcon = Crown;
              badgeColor = "text-purple-700 bg-purple-50 border-purple-200";
              borderColor = "border-purple-200 hover:border-purple-400";
              shadowGlow = "hover:shadow-[0_0_25px_-3px_rgba(168,85,247,0.4)]";
              gradientColor = "purple";
            } else if (planConfig?.id === "featured") {
              BadgeIcon = Star;
              badgeColor = "text-amber-700 bg-amber-50 border-amber-200";
              borderColor = "border-amber-200 hover:border-amber-400";
              shadowGlow = "hover:shadow-[0_0_25px_-3px_rgba(251,191,36,0.4)]";
              gradientColor = "amber";
            }
            
            const expiresAt = project.expires_at ? new Date(project.expires_at) : null;
            const daysRemaining = expiresAt 
              ? Math.max(0, Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
              : 0;

            return (
              <ScrollReveal key={project.id} delay={index * 100}>
                <div className={`bg-white p-6 rounded-2xl border transition-all duration-500 flex flex-col h-full relative overflow-hidden group shadow-sm hover:-translate-y-1 ${borderColor} ${shadowGlow}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br from-${gradientColor}-50/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest shadow-sm ${badgeColor}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {planConfig?.name || "Featured"}
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50/80 backdrop-blur-sm border border-neutral-200 text-neutral-600 text-[11px] font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {daysRemaining}d left
                    </div>
                  </div>

                  <div className="relative z-10 mb-6 flex-grow">
                    <h3 className="font-extrabold text-xl text-neutral-900 tracking-tight mb-2 truncate group-hover:text-black transition-colors">
                      {project.project_name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 rounded-md bg-neutral-100/80 text-xs text-neutral-700 font-semibold flex items-center gap-1.5 border border-neutral-200/60 backdrop-blur-sm">
                        <Code2 className="w-3.5 h-3.5 text-neutral-500" />
                        {project.framework}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <Link href={`/featured/project/${project.id}`}>
                      <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white group-hover:bg-${gradientColor}-50 text-neutral-700 group-hover:text-${gradientColor}-700 border border-neutral-200 group-hover:border-${gradientColor}-300 text-sm font-bold transition-all duration-300 shadow-sm group-hover:shadow-inner`}>
                        View Project
                        <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
