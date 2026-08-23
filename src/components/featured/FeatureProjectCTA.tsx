"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Zap, TrendingUp, Clock } from "lucide-react";
import { FEATURED_PLANS, type PlanType } from "@/lib/featured/types";

interface FeatureProjectCTAProps {
  resultId: string;
  projectName: string;
  framework: string;
  hostName: string;
}

export function FeatureProjectCTA({
  resultId,
  projectName,
  framework,
  hostName,
}: FeatureProjectCTAProps) {
  const [loading, setLoading] = useState(true);
  const [featuredData, setFeaturedData] = useState<{
    featured: boolean;
    project?: { 
      id: string; 
      plan?: PlanType;
      expires_at?: string;
    };
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      if (!resultId.startsWith("github-")) {
        if (!cancelled) setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/featured/check?resultId=${encodeURIComponent(resultId)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setFeaturedData(data);
        }
      } catch (err) {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkStatus();
    return () => { cancelled = true; };
  }, [resultId]);

  if (!resultId.startsWith("github-")) return null;
  if (loading) return null; // Or a subtle skeleton, but returning null prevents layout shifts if it's fast

  const repoUrl = `https://github.com/${resultId.replace("github-", "").split("-").slice(0, 2).join("/")}`;
  
  const checkoutHref = `/featured/checkout?repo=${encodeURIComponent(repoUrl)}&name=${encodeURIComponent(
    projectName
  )}&framework=${encodeURIComponent(framework)}&host=${encodeURIComponent(hostName)}&resultId=${encodeURIComponent(
    resultId
  )}`;

  const isFeatured = featuredData?.featured;
  const currentPlanId = featuredData?.project?.plan as PlanType | undefined;
  const planConfig = currentPlanId ? FEATURED_PLANS[currentPlanId] : null;
  const expiresAt = featuredData?.project?.expires_at ? new Date(featuredData.project.expires_at) : null;
  
  const daysRemaining = expiresAt 
    ? Math.max(0, Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="mb-8">
      <div className="p-8 rounded-2xl glass relative overflow-hidden group border border-amber-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-primary/5 opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              {isFeatured ? <TrendingUp className="w-6 h-6 text-amber-400" /> : <Zap className="w-6 h-6 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-white">
                  {isFeatured ? "Currently Featured" : "Feature This Project"}
                </h3>
                {isFeatured && planConfig && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    {planConfig.name} Plan
                    {daysRemaining !== null && (
                      <span className="opacity-80 flex items-center gap-1 ml-1">
                        <Clock className="w-3 h-3" />
                        {daysRemaining}d left
                      </span>
                    )}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-400 mt-1">
                {isFeatured 
                  ? "This project is currently promoted on the HostWhere leaderboard." 
                  : "Promote your project on HostWhere and get more visibility."}
              </p>
            </div>
          </div>
          <Link href={checkoutHref} className="shrink-0">
            <button className="cta-glow flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              {isFeatured ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Extend or Upgrade
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  Choose a Plan
                </>
              )}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
