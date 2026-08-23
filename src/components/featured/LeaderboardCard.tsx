"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink,
  TrendingUp,
  MousePointerClick,
  Crown,
  Medal,
  Award,
  Clock,
} from "lucide-react";
import type { FeaturedProjectWithRank, PlanType } from "@/lib/featured/types";
import { FEATURED_PLANS } from "@/lib/featured/types";

// ── Framework label map ──────────────────────────────────────
const FRAMEWORK_LABELS: Record<string, string> = {
  nextjs: "Next.js",
  react: "React",
  vue: "Vue.js",
  nuxt: "Nuxt",
  svelte: "Svelte",
  sveltekit: "SvelteKit",
  angular: "Angular",
  astro: "Astro",
  gatsby: "Gatsby",
  remix: "Remix",
  express: "Express",
  fastify: "Fastify",
  nestjs: "NestJS",
  hono: "Hono",
  flask: "Flask",
  django: "Django",
  fastapi: "FastAPI",
  rails: "Rails",
  laravel: "Laravel",
  "static-html": "Static HTML",
  unknown: "Unknown",
};

// ── Rank badge styling ───────────────────────────────────────
function rankBadge(rank: number) {
  if (rank === 1) {
    return {
      icon: <Crown className="w-5 h-5" />,
      bg: "bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-amber-500/40",
      text: "text-amber-400",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    };
  }
  if (rank === 2) {
    return {
      icon: <Medal className="w-5 h-5" />,
      bg: "bg-gradient-to-br from-slate-300/15 to-slate-400/15 border-slate-400/30",
      text: "text-slate-300",
      glow: "shadow-[0_0_20px_rgba(148,163,184,0.1)]",
    };
  }
  if (rank === 3) {
    return {
      icon: <Award className="w-5 h-5" />,
      bg: "bg-gradient-to-br from-orange-600/15 to-amber-700/15 border-orange-600/30",
      text: "text-orange-400",
      glow: "shadow-[0_0_20px_rgba(234,88,12,0.1)]",
    };
  }
  return {
    icon: null,
    bg: "bg-white/5 border-white/10",
    text: "text-neutral-400",
    glow: "",
  };
}

interface LeaderboardCardProps {
  project: FeaturedProjectWithRank;
}

export function LeaderboardCard({ project }: LeaderboardCardProps) {
  const [clicks, setClicks] = useState(project.total_clicks);
  const [clicking, setClicking] = useState(false);

  const badge = rankBadge(project.rank);
  const frameworkLabel =
    FRAMEWORK_LABELS[project.framework] || project.framework || "Unknown";

  const planConfig = project.plan ? FEATURED_PLANS[project.plan as PlanType] : FEATURED_PLANS.boost;
  const expiresAt = project.expires_at ? new Date(project.expires_at) : null;
  const daysRemaining = expiresAt 
    ? Math.max(0, Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleViewProject = useCallback(async () => {
    if (clicking) return;
    setClicking(true);

    try {
      const res = await fetch(`/api/featured/${project.id}/click`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setClicks(data.total_clicks || clicks + 1);
      }
    } catch {
      // silently fail
    } finally {
      setClicking(false);
    }

    // Open the repo in a new tab
    window.open(project.repository_url, "_blank", "noopener,noreferrer");
  }, [project.id, project.repository_url, clicks, clicking]);

  return (
    <div
      className={`glass rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-all duration-300 hover:bg-white/[0.04] group ${badge.glow}`}
    >
      {/* Top gradient line for top 3 */}
      {project.rank <= 3 && (
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
            project.rank === 1
              ? "via-amber-500/50"
              : project.rank === 2
                ? "via-slate-400/40"
                : "via-orange-500/40"
          } to-transparent`}
        />
      )}

      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center shrink-0 ${badge.bg} ${badge.text}`}
        >
          {badge.icon || (
            <span className="text-lg font-bold">#{project.rank}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-white truncate">
                {project.project_name}
              </h3>
              <p className="text-xs text-neutral-500 truncate mt-0.5 font-mono">
                {project.repository_url.replace("https://github.com/", "")}
              </p>
            </div>

            {/* Plan Info */}
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {planConfig?.name || "Featured"} Plan
              </div>
              <div className="flex items-center justify-end gap-1.5 text-xs text-neutral-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {daysRemaining}d remaining
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Framework badge */}
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary/80 border border-primary/20">
              {frameworkLabel}
            </span>

            {/* Hosting badge */}
            {project.recommended_host && project.recommended_host !== "unknown" && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20">
                {project.recommended_host}
              </span>
            )}

            {/* Click count */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white/5 text-neutral-400 border border-white/5">
              <MousePointerClick className="w-3 h-3" />
              {clicks}
            </span>

            {/* Rank if > 3 */}
            {project.rank > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-white/5 text-neutral-400 border border-white/5">
                #{project.rank}
              </span>
            )}
          </div>

          {/* Description */}
          {project.description && project.description !== "" && (
            <p className="text-sm text-neutral-400 mt-3 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleViewProject}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-all"
            >
              View Project
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <Link
              href={`/featured/checkout?repo=${encodeURIComponent(project.repository_url)}&name=${encodeURIComponent(project.project_name)}&framework=${encodeURIComponent(project.framework)}&host=${encodeURIComponent(project.recommended_host)}&existing=true`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary hover:text-blue-300 transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Extend or Upgrade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
