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
            <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-6 shadow-sm">
              <Star className="w-8 h-8 text-neutral-400 fill-neutral-400" />
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
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 shadow-sm text-sm font-medium transition-colors">
                Feature Your Project
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
            let borderColor = "border-neutral-200 hover:border-blue-300 hover:shadow-blue-100";
            let gradientColor = "blue";
            
            if (planConfig?.id === "spotlight") {
              BadgeIcon = Crown;
              badgeColor = "text-purple-700 bg-purple-50 border-purple-200";
              borderColor = "border-purple-200 hover:border-purple-400 hover:shadow-purple-100";
              gradientColor = "purple";
            } else if (planConfig?.id === "featured") {
              BadgeIcon = Star;
              badgeColor = "text-amber-700 bg-amber-50 border-amber-200";
              borderColor = "border-amber-200 hover:border-amber-400 hover:shadow-amber-100";
              gradientColor = "amber";
            }
            
            const expiresAt = project.expires_at ? new Date(project.expires_at) : null;
            const daysRemaining = expiresAt 
              ? Math.max(0, Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
              : 0;

            return (
              <ScrollReveal key={project.id} delay={index * 100}>
                <div className={`bg-white p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full relative overflow-hidden group shadow-sm hover:shadow-md hover:-translate-y-1 ${borderColor}`}>
                  <div className={`absolute inset-0 bg-gradient-to-b from-${gradientColor}-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {planConfig?.name || "Featured"}
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {daysRemaining}d left
                    </div>
                  </div>

                  <div className="relative z-10 mb-6 flex-grow">
                    <h3 className="font-bold text-xl text-neutral-900 tracking-tight mb-2 truncate">
                      {project.project_name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 rounded-md bg-neutral-50 text-xs text-neutral-600 font-medium flex items-center gap-1.5 border border-neutral-200">
                        <Code2 className="w-3 h-3" />
                        {project.framework}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <Link href={`/featured/project/${project.id}`}>
                      <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-${gradientColor}-50 text-neutral-700 hover:text-${gradientColor}-700 border border-neutral-200 hover:border-${gradientColor}-200 text-sm font-bold transition-all shadow-sm`}>
                        View Project
                        <ArrowRight className="w-4 h-4 opacity-70" />
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
