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
import { useRouter } from "next/navigation";
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
      bg: "bg-amber-100 border-amber-300",
      text: "text-amber-700",
      glow: "shadow-sm",
    };
  }
  if (rank === 2) {
    return {
      icon: <Medal className="w-5 h-5" />,
      bg: "bg-neutral-100 border-neutral-300",
      text: "text-neutral-700",
      glow: "shadow-sm",
    };
  }
  if (rank === 3) {
    return {
      icon: <Award className="w-5 h-5" />,
      bg: "bg-orange-50 border-orange-200",
      text: "text-orange-800",
      glow: "",
    };
  }
  return {
    icon: null,
    bg: "bg-neutral-50 border-neutral-200",
    text: "text-neutral-500",
    glow: "",
  };
}

interface LeaderboardCardProps {
  project: FeaturedProjectWithRank;
}

export function LeaderboardCard({ project }: LeaderboardCardProps) {
  const router = useRouter();
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

    // Go to project profile
    router.push(`/featured/project/${project.id}`);
  }, [project.id, clicks, clicking, router]);

  return (
    <div
      className={`glass rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-all duration-300 hover:bg-neutral-50 group ${badge.glow}`}
    >
      {/* Top gradient line for top 3 */}
      {project.rank <= 3 && (
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
            project.rank === 1
              ? "via-amber-300"
              : project.rank === 2
                ? "via-neutral-300"
                : "via-orange-200"
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
              <h3 className="font-bold text-lg text-neutral-900 truncate">
                {project.project_name}
              </h3>
              <p className="text-xs text-neutral-500 truncate mt-0.5 font-mono">
                {project.repository_url.replace("https://github.com/", "")}
              </p>
            </div>

            {/* Plan Info */}
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {planConfig?.name || "Featured"} Plan
              </div>
              <div className="flex items-center justify-end gap-1.5 text-xs text-neutral-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {daysRemaining}d remaining
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Framework badge */}
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200">
              {frameworkLabel}
            </span>

            {/* Hosting badge */}
            {project.recommended_host && project.recommended_host !== "unknown" && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200">
                {project.recommended_host}
              </span>
            )}

            {/* Click count */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200">
              <MousePointerClick className="w-3 h-3" />
              {clicks}
            </span>

            {/* Rank if > 3 */}
            {project.rank > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200">
                #{project.rank}
              </span>
            )}
          </div>

          {/* Description */}
          {project.description && project.description !== "" && (
            <p className="text-sm text-neutral-600 mt-3 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleViewProject}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 hover:text-neutral-900 transition-all"
            >
              View Project
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <Link
              href={`/featured/checkout?repo=${encodeURIComponent(project.repository_url)}&name=${encodeURIComponent(project.project_name)}&framework=${encodeURIComponent(project.framework)}&host=${encodeURIComponent(project.recommended_host)}&existing=true`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-blue-600 hover:bg-blue-700 border border-transparent text-white shadow-sm transition-all"
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
