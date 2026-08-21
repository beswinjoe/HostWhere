"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode2,
  Cpu,
  Database,
  Box,
  Wifi,
  Server,
  Container,
  Timer,
  Clock,
  Shield,
  GitBranch,
  Zap,
  Terminal,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  Code2,
  Info,
  Share2,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import type {
  AnalysisResult,
  PlatformCompatibility,
  CompatibilityStatus,
  ProjectProfile,
} from "@/lib/analyzer/types";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function statusIcon(status: CompatibilityStatus) {
  switch (status) {
    case "compatible":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "possible":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case "incompatible":
      return <XCircle className="w-5 h-5 text-red-500" />;
  }
}

function statusLabel(status: CompatibilityStatus) {
  switch (status) {
    case "compatible":
      return "Compatible";
    case "possible":
      return "Possible with changes";
    case "incompatible":
      return "Not compatible";
  }
}

function statusColorClass(status: CompatibilityStatus) {
  switch (status) {
    case "compatible":
      return "text-emerald-400";
    case "possible":
      return "text-yellow-400";
    case "incompatible":
      return "text-red-400";
  }
}

function statusBgClass(status: CompatibilityStatus) {
  switch (status) {
    case "compatible":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "possible":
      return "bg-yellow-500/10 border-yellow-500/20";
    case "incompatible":
      return "bg-red-500/10 border-red-500/20";
  }
}

function frameworkLabel(fw: string | null): string {
  if (!fw) return "Unknown";
  const map: Record<string, string> = {
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
    koa: "Koa",
    flask: "Flask",
    django: "Django",
    fastapi: "FastAPI",
    rails: "Rails",
    spring: "Spring",
    laravel: "Laravel",
    hugo: "Hugo",
    jekyll: "Jekyll",
    eleventy: "Eleventy",
    vite: "Vite",
    "static-html": "Static HTML",
    unknown: "Unknown",
  };
  return map[fw] || fw;
}

function runtimeLabel(rt: string): string {
  const map: Record<string, string> = {
    node: "Node.js",
    deno: "Deno",
    bun: "Bun",
    python: "Python",
    ruby: "Ruby",
    go: "Go",
    rust: "Rust",
    java: "Java",
    dotnet: ".NET",
    php: "PHP",
    static: "Static",
    unknown: "Unknown",
  };
  return map[rt] || rt;
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function ProjectSummary({ 
  profile, 
  fileCount, 
  projectName,
  resultId
}: { 
  profile: ProjectProfile; 
  fileCount: number; 
  projectName: string;
  resultId: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      const resultUrl = `${window.location.origin}/results/${resultId}`;
      const shareText = `Check out the hosting compatibility report for ${projectName}`;

      if (navigator.share) {
        await navigator.share({
          title: "HostWhere Report",
          text: shareText,
          url: resultUrl,
        });
      } else {
        await navigator.clipboard.writeText(resultUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  }, [projectName]);

  const items = [
    { icon: FileCode2, label: "Framework", value: frameworkLabel(profile.framework) },
    { icon: Code2, label: "Language", value: profile.language },
    { icon: Cpu, label: "Runtime", value: runtimeLabel(profile.runtime) },
    { icon: Box, label: "Package Manager", value: profile.packageManager },
    { icon: Terminal, label: "Build Command", value: profile.buildCommand || "—" },
    { icon: Terminal, label: "Start Command", value: profile.startCommand || "—" },
  ];

  const booleans = [
    { icon: Database, label: "Database", active: profile.databases.length > 0, detail: profile.databases.join(", ") },
    { icon: Wifi, label: "WebSockets", active: profile.usesWebSockets },
    { icon: Server, label: "Workers", active: profile.usesWorkers },
    { icon: Timer, label: "Cron Jobs", active: profile.usesCron },
    { icon: Clock, label: "Persistent Process", active: profile.requiresPersistentProcess },
    { icon: Container, label: "Docker", active: profile.usesDocker },
    { icon: GitBranch, label: "Monorepo", active: !!profile.monorepo },
    { icon: Shield, label: "Env Vars", active: profile.environmentVariables.length > 0, detail: `${profile.environmentVariables.length} detected` },
    { icon: Zap, label: "Static Site", active: profile.staticSite },
  ];

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <FileCode2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-xl sm:text-2xl text-white tracking-tight">{projectName}</h2>
            <p className="text-sm text-neutral-400 mt-1">{fileCount} files analyzed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-colors text-white"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share Report"}
          </button>
          <Link href="/analyze">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-full text-sm font-medium transition-colors">
              Analyze Another
            </button>
          </Link>
        </div>
      </div>

      {/* Key Info */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {items.map((item) => (
          <div key={item.label} className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">{item.label}</span>
            </div>
            <div className="text-sm font-medium text-white truncate mt-auto">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Detected Requirements */}
      <div className="relative z-10">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Detected Capabilities</h3>
        <div className="flex flex-wrap gap-2">
          {booleans.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                item.active
                  ? "bg-primary/10 border-primary/20 text-white"
                  : "bg-black/40 border-white/5 text-neutral-500"
              }`}
            >
              <item.icon className={`w-3.5 h-3.5 shrink-0 ${item.active ? "text-primary/80" : "opacity-50"}`} />
              <span>{item.label}</span>
              {item.active && item.detail && (
                <span className="ml-1 opacity-60 font-normal">({item.detail})</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeploymentReadinessView({ result }: { result: AnalysisResult }) {
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const dr = result.deploymentReadiness;

  if (!dr) return null;

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Readiness Checklist */}
        <div className="flex-1">
           <div className="flex items-center gap-2 mb-1">
             <CheckCircle2 className="w-5 h-5 text-primary" />
             <h2 className="text-xl font-bold">Deployment Readiness</h2>
           </div>
           <p className="text-neutral-400 text-sm mb-6">Based on static analysis of project configuration</p>
           
           <div className="flex items-center gap-4 mb-6">
             <div className="font-display font-extrabold text-[48px] leading-none tracking-[-0.035em]">
               {dr.score}<span className="text-[24px] text-neutral-500 font-bold tracking-normal">/100</span>
             </div>
             <div>
               <div className="text-xs font-semibold uppercase tracking-wider text-primary border border-primary/20 bg-primary/10 px-2 py-1 rounded">
                 {dr.label}
               </div>
             </div>
           </div>

           <div className="space-y-3">
             {dr.items.map((item, i) => (
               <div key={i} className="flex items-start gap-3">
                 <div className="mt-0.5 shrink-0">
                   {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                   {item.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                   {item.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                   {item.status === 'info' && <Info className="w-4 h-4 text-neutral-400" />}
                 </div>
                 <div>
                   <div className="text-sm font-medium text-white">{item.label}</div>
                   {item.description && <div className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{item.description}</div>}
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Detection Evidence */}
        <div className="flex-1 md:border-l md:border-white/10 md:pl-8 mt-8 md:mt-0">
          <div className="flex items-center gap-2 mb-1">
             <Shield className="w-5 h-5 text-primary" />
             <h2 className="text-xl font-bold">Detection Evidence</h2>
          </div>
          <p className="text-neutral-400 text-sm mb-6">Transparent proof for important detections</p>

          <div className="space-y-3">
            {result.profile.detectedRequirements.map((req, i) => (
              <div key={i} className="rounded-xl bg-black/40 border border-white/5 overflow-hidden transition-colors hover:bg-white/[0.02]">
                <button onClick={() => setExpandedReq(expandedReq === req.name ? null : req.name)} className="w-full flex items-center justify-between p-4 text-left">
                  <div>
                    <div className="text-sm font-semibold text-white">{req.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.confidence && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        req.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        req.confidence === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                      }`}>
                        {req.confidence}
                      </span>
                    )}
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                      {expandedReq === req.name ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
                    </div>
                  </div>
                </button>
                {expandedReq === req.name && (
                  <div className="p-4 pt-0 border-t border-white/5 mt-2 space-y-3">
                    <p className="text-xs text-neutral-400 bg-white/5 p-2 rounded-md">{req.description}</p>
                    {req.evidence.length > 0 ? (
                      <ul className="space-y-2.5 mt-3">
                        {req.evidence.map((e, j) => (
                          <li key={j} className="text-xs flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0 mt-1" />
                            <div>
                              <div className="font-mono text-[11px] text-neutral-300 bg-black/50 px-1.5 py-0.5 rounded border border-white/5 inline-block mb-1 break-all">{e.file}</div>
                              <div className="text-neutral-400 leading-relaxed">{e.snippet}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-neutral-500 italic mt-3">No specific file evidence stored.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {result.profile.detectedRequirements.length === 0 && (
              <div className="p-6 rounded-xl border border-white/5 border-dashed text-center">
                <p className="text-sm text-neutral-500">No complex requirements detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformCard({
  platform,
  allPlatforms,
  expanded,
  onToggle,
}: {
  platform: PlatformCompatibility;
  allPlatforms: PlatformCompatibility[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const betterAlternatives = platform.status !== "compatible" 
    ? allPlatforms.filter(p => p.score > platform.score && p.status === "compatible").slice(0, 3)
    : [];
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        expanded ? "border-primary/30 bg-white/[0.03]" : "border-white/10 bg-black/40 hover:bg-white/[0.02]"
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer group"
      >
        <div className="flex items-center gap-4 sm:gap-5">
          <div className={`p-2.5 rounded-xl border ${statusBgClass(platform.status)}`}>
            {statusIcon(platform.status)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1 sm:mb-0">
              <div className="font-display font-bold text-[32px] md:text-[42px] tracking-[-0.03em] text-white group-hover:text-primary transition-colors leading-none">{platform.platform.name}</div>
              {platform.platform.verified && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                  Verified
                </span>
              )}
            </div>
            <div className="text-sm text-neutral-400 mt-1 hidden sm:block">
              {platform.platform.description}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${statusBgClass(platform.status)} ${statusColorClass(platform.status)}`}
          >
            {statusLabel(platform.status)}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors hidden sm:flex">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-white" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/5">
          {/* Score bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-neutral-400 font-medium">Compatibility Score</span>
              <div className={`font-display font-extrabold tracking-[-0.035em] text-[48px] md:text-[64px] leading-none ${statusColorClass(platform.status)}`}>
                {platform.score}<span className="text-[24px] md:text-[32px] text-neutral-500 font-bold tracking-normal">/100</span>
              </div>
            </div>
            <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  platform.status === "compatible"
                    ? "bg-emerald-500"
                    : platform.status === "possible"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.max(platform.score, 3)}%` }}
              />
            </div>
          </div>

          {platform.status !== "compatible" && (
            <div className="mb-8 p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="font-semibold text-lg text-white mb-2">Why not {platform.platform.name}?</h3>
              <p className="text-neutral-300 leading-relaxed mb-4">{platform.why}</p>
              
              {betterAlternatives.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Better Alternatives</h4>
                  <div className="space-y-2">
                    {betterAlternatives.map(alt => (
                      <div key={alt.platform.id} className="flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-white">{alt.platform.name}</span>
                          <span className="text-neutral-400 ml-2">— {alt.why || alt.platform.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Blockers */}
              {platform.blockers.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-3 text-red-400">
                    <XCircle className="w-4 h-4" />
                    Blockers ({platform.blockers.length})
                  </h4>
                  <div className="space-y-3">
                    {platform.blockers.map((b, i) => (
                      <div key={i} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <div className="font-semibold text-sm mb-1.5 text-red-300">{b.rule}</div>
                        <p className="text-neutral-400 text-sm leading-relaxed">{b.reason}</p>
                        {b.suggestion && (
                          <p className="text-sm text-red-200 mt-3 pt-3 border-t border-red-500/10 flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                            {b.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {platform.warnings.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-3 text-yellow-400">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings ({platform.warnings.length})
                  </h4>
                  <div className="space-y-3">
                    {platform.warnings.map((w, i) => (
                      <div key={i} className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                        <div className="font-semibold text-sm mb-1.5 text-yellow-300">{w.rule}</div>
                        <p className="text-neutral-400 text-sm leading-relaxed">{w.reason}</p>
                        {w.suggestion && (
                          <p className="text-sm text-yellow-200 mt-3 pt-3 border-t border-yellow-500/10 flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                            {w.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Passes */}
              {platform.passes.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-3 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Passed Checks ({platform.passes.length})
                  </h4>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5">
                    {platform.passes.map((p, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-neutral-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500/50 shrink-0 mt-0.5" />
                        {p.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {platform.recommendations.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold mb-3 text-primary">
                    <Zap className="w-4 h-4" />
                    Recommendations
                  </h4>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2.5">
                    {platform.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-neutral-300">
                        <ChevronRight className="w-4 h-4 text-primary/50 shrink-0 mt-0.5" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform link */}
              <div className="pt-4">
                <a
                  href={platform.platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                >
                  Visit {platform.platform.name}
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ platform }: { platform: PlatformCompatibility }) {
  if (!platform || platform.status !== "compatible") return null;

  return (
    <div className="glass p-8 rounded-2xl border border-primary/30 relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-primary">Recommended Platform</h2>
          </div>
          <h3 className="font-display text-[48px] md:text-[64px] font-extrabold tracking-[-0.035em] text-white mb-3 leading-tight">
            Best match: {platform.platform.name}
          </h3>
          <p className="text-neutral-300 leading-relaxed max-w-2xl text-base">
            {platform.why || platform.platform.description}
          </p>
        </div>
        <a 
          href={platform.platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          Deploy to {platform.platform.name}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Results Page
// ─────────────────────────────────────────────────────────────

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        // Use a cache-busting query parameter to ensure we bypass aggressive browser/CDN caches
        const timestamp = Date.now();
        const response = await fetch(`/api/results/${id}?t=${timestamp}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load results.");
          setLoading(false);
          return;
        }

        setResult(data.result);
        
        // Sort platforms by score (highest first)
        const sortedPlatforms = [...data.result.platforms].sort((a, b) => b.score - a.score);
        
        // Auto-expand the first non-compatible platform, or the first one
        const firstInteresting = sortedPlatforms.find(
          (p: PlatformCompatibility) => p.status !== "compatible"
        );
        setExpandedPlatform(
          firstInteresting?.platform.id || sortedPlatforms[0]?.platform.id
        );
      } catch {
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [id]);

  const togglePlatform = useCallback(
    (platformId: string) => {
      setExpandedPlatform((prev) => (prev === platformId ? null : platformId));
    },
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
        <Navbar />
        <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
        <main className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-6" />
            <p className="text-neutral-400 font-medium tracking-wide">Retrieving analysis report…</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
        <Navbar />
        <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
        <main className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="glass p-10 rounded-3xl text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Result not found</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
              {error || "This result may have expired. Please analyze your project again."}
            </p>
            <Link href="/analyze">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-full font-semibold transition-all">
                <Upload className="w-4 h-4" />
                Analyze Again
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Sort platforms for display: compatible > possible > incompatible
  const sortedPlatforms = [...result.platforms].sort((a, b) => {
    const rank = { compatible: 3, possible: 2, incompatible: 1 };
    return rank[b.status] - rank[a.status];
  });

  const compatibleCount = result.platforms.filter((p) => p.status === "compatible").length;
  const possibleCount = result.platforms.filter((p) => p.status === "possible").length;
  const incompatibleCount = result.platforms.filter((p) => p.status === "incompatible").length;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden">
      <Navbar />
      
      {/* Backgrounds */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-20 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-5xl mx-auto w-full">
        
        {/* Status Summary Cards */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass p-6 rounded-2xl border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-emerald-500/80 uppercase tracking-wider mb-1">Compatible</div>
                  <div className="font-display text-[48px] md:text-[64px] font-extrabold text-white leading-none tracking-[-0.035em]">{compatibleCount}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
            
            <div className="glass p-6 rounded-2xl border-yellow-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-yellow-500/80 uppercase tracking-wider mb-1">Possible</div>
                  <div className="font-display text-[48px] md:text-[64px] font-extrabold text-white leading-none tracking-[-0.035em]">{possibleCount}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border-red-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-red-500/80 uppercase tracking-wider mb-1">Incompatible</div>
                  <div className="font-display text-[48px] md:text-[64px] font-extrabold text-white leading-none tracking-[-0.035em]">{incompatibleCount}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Project Summary */}
        <ScrollReveal delay={100}>
          <div className="mb-6">
            <ProjectSummary
              profile={result.profile}
              fileCount={result.fileCount}
              projectName={result.projectName}
              resultId={result.id}
            />
          </div>
        </ScrollReveal>

        {/* Deployment Readiness */}
        <ScrollReveal delay={125}>
          <div className="mb-12">
            <DeploymentReadinessView result={result} />
          </div>
        </ScrollReveal>

        {/* Recommendation Card */}
        {sortedPlatforms[0]?.status === "compatible" && (
          <ScrollReveal delay={150}>
            <div className="mb-12">
              <RecommendationCard platform={sortedPlatforms[0]} />
            </div>
          </ScrollReveal>
        )}

        {/* Platform Results */}
        <ScrollReveal delay={200}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Platform Compatibility</h2>
            <span className="text-sm text-neutral-500">
              Analyzed {new Date(result.analyzedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="space-y-4">
            {sortedPlatforms.map((p) => (
              <PlatformCard
                key={p.platform.id}
                platform={p}
                allPlatforms={sortedPlatforms}
                expanded={expandedPlatform === p.platform.id}
                onToggle={() => togglePlatform(p.platform.id)}
              />
            ))}
          </div>
        </ScrollReveal>

        {/* Disclaimer & Final CTA */}
        <ScrollReveal delay={300}>
          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-sm text-neutral-400 leading-relaxed">
              <div className="flex items-start gap-3 mb-3">
                <Info className="w-5 h-5 text-neutral-500 shrink-0" />
                <h4 className="font-semibold text-white">Disclaimer</h4>
              </div>
              <p>
                Compatibility estimates are based on detected project requirements and platform capabilities. Always verify current platform limits before deployment. Results are based on static analysis and may not capture all dynamic runtime behaviors.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl glass flex flex-col justify-center items-center text-center">
              <h4 className="font-bold text-lg mb-2">Have another project?</h4>
              <p className="text-neutral-400 text-sm mb-6">Drop in a new ZIP archive to instantly see where it can be hosted.</p>
              <Link href="/analyze">
                <button className="cta-glow flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-full font-semibold transition-all">
                  <Upload className="w-4 h-4" />
                  Analyze Another Project
                </button>
              </Link>
            </div>
          </div>
        </ScrollReveal>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6 relative z-10 bg-black">
        <div className="max-w-5xl mx-auto flex items-center justify-center text-center">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} HostWhere — Free and open-source project analyzer.
          </p>
        </div>
      </footer>
    </div>
  );
}
