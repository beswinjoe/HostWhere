"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  Globe,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      return <CheckCircle2 className="w-5 h-5 status-compatible" />;
    case "possible":
      return <AlertTriangle className="w-5 h-5 status-possible" />;
    case "incompatible":
      return <XCircle className="w-5 h-5 status-incompatible" />;
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
      return "status-compatible";
    case "possible":
      return "status-possible";
    case "incompatible":
      return "status-incompatible";
  }
}

function statusBgClass(status: CompatibilityStatus) {
  switch (status) {
    case "compatible":
      return "status-bg-compatible";
    case "possible":
      return "status-bg-possible";
    case "incompatible":
      return "status-bg-incompatible";
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

function ProjectSummary({ profile, fileCount, projectName }: {
  profile: ProjectProfile;
  fileCount: number;
  projectName: string;
}) {
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
    <div className="rounded-xl border border-border/50 bg-card/30 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileCode2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">{projectName}</h2>
          <p className="text-xs text-muted-foreground">{fileCount} files analyzed</p>
        </div>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {items.map((item) => (
          <div key={item.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{item.label}</span>
            </div>
            <div className="text-sm font-medium truncate">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Detected Requirements */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {booleans.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs border transition-colors ${
              item.active
                ? "bg-primary/5 border-primary/15 text-foreground"
                : "bg-muted/20 border-border/20 text-muted-foreground/50"
            }`}
          >
            <item.icon className={`w-3 h-3 shrink-0 ${item.active ? "text-primary" : ""}`} />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformCard({
  platform,
  expanded,
  onToggle,
}: {
  platform: PlatformCompatibility;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        expanded ? "border-primary/30 bg-card/60" : "border-border/50 bg-card/30 hover:bg-card/50"
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {statusIcon(platform.status)}
          <div>
            <div className="font-medium">{platform.platform.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {platform.platform.description.length > 70
                ? platform.platform.description.substring(0, 70) + "…"
                : platform.platform.description}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`${statusBgClass(platform.status)} ${statusColorClass(platform.status)} border text-[11px]`}
          >
            {statusLabel(platform.status)}
          </Badge>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
          {/* Score bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Compatibility Score</span>
              <span className={`font-mono font-medium ${statusColorClass(platform.status)}`}>
                {platform.score}/100
              </span>
            </div>
            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  platform.status === "compatible"
                    ? "bg-green-500"
                    : platform.status === "possible"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.max(platform.score, 3)}%` }}
              />
            </div>
          </div>

          {/* Blockers */}
          {platform.blockers.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-medium mb-2 status-incompatible">
                <XCircle className="w-3 h-3" />
                Blockers ({platform.blockers.length})
              </h4>
              <div className="space-y-2">
                {platform.blockers.map((b, i) => (
                  <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-sm">
                    <div className="font-medium text-xs mb-1 text-red-400">{b.rule}</div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{b.reason}</p>
                    {b.suggestion && (
                      <p className="text-xs text-primary/80 mt-2 flex items-start gap-1">
                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
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
              <h4 className="flex items-center gap-1.5 text-xs font-medium mb-2 status-possible">
                <AlertTriangle className="w-3 h-3" />
                Warnings ({platform.warnings.length})
              </h4>
              <div className="space-y-2">
                {platform.warnings.map((w, i) => (
                  <div key={i} className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-sm">
                    <div className="font-medium text-xs mb-1 text-yellow-400">{w.rule}</div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{w.reason}</p>
                    {w.suggestion && (
                      <p className="text-xs text-primary/80 mt-2 flex items-start gap-1">
                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
                        {w.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passes */}
          {platform.passes.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-medium mb-2 status-compatible">
                <CheckCircle2 className="w-3 h-3" />
                Passed Checks ({platform.passes.length})
              </h4>
              <div className="space-y-1">
                {platform.passes.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500/60 shrink-0" />
                    {p.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {platform.recommendations.length > 0 && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <h4 className="text-xs font-medium mb-2 text-primary">Recommendations</h4>
              <ul className="space-y-1">
                {platform.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-primary/50 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Platform link */}
          <a
            href={platform.platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors"
          >
            Visit {platform.platform.name}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
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
        const response = await fetch(`/api/results/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load results.");
          setLoading(false);
          return;
        }

        setResult(data.result);
        // Auto-expand the first non-compatible platform, or the first one
        const firstInteresting = data.result.platforms.find(
          (p: PlatformCompatibility) => p.status !== "compatible"
        );
        setExpandedPlatform(
          firstInteresting?.platform.id || data.result.platforms[0]?.platform.id
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
      <div className="flex flex-col min-h-screen">
        <ResultsNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading results…</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col min-h-screen">
        <ResultsNav />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5 border border-destructive/20">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Result not found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error || "This result may have expired. Please analyze your project again."}
            </p>
            <Link href="/analyze">
              <Button className="gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Analyze Again
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const compatibleCount = result.platforms.filter(
    (p) => p.status === "compatible"
  ).length;
  const possibleCount = result.platforms.filter(
    (p) => p.status === "possible"
  ).length;
  const incompatibleCount = result.platforms.filter(
    (p) => p.status === "incompatible"
  ).length;

  return (
    <div className="flex flex-col min-h-screen">
      <ResultsNav />

      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        {/* Summary Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Analysis Results
          </h1>
          <p className="text-sm text-muted-foreground">
            Analyzed on{" "}
            {new Date(result.analyzedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-3 mb-8 animate-slide-up stagger-1 opacity-0">
          <div className="p-4 rounded-xl border status-bg-compatible text-center">
            <div className="text-2xl font-bold status-compatible">{compatibleCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Compatible</div>
          </div>
          <div className="p-4 rounded-xl border status-bg-possible text-center">
            <div className="text-2xl font-bold status-possible">{possibleCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Possible</div>
          </div>
          <div className="p-4 rounded-xl border status-bg-incompatible text-center">
            <div className="text-2xl font-bold status-incompatible">{incompatibleCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Incompatible</div>
          </div>
        </div>

        {/* Project Summary */}
        <div className="mb-8 animate-slide-up stagger-2 opacity-0">
          <ProjectSummary
            profile={result.profile}
            fileCount={result.fileCount}
            projectName={result.projectName}
          />
        </div>

        {/* Platform Results */}
        <div className="animate-slide-up stagger-3 opacity-0">
          <h2 className="font-semibold text-lg mb-4">Platform Compatibility</h2>
          <div className="space-y-3">
            {result.platforms.map((p) => (
              <PlatformCard
                key={p.platform.id}
                platform={p}
                expanded={expandedPlatform === p.platform.id}
                onToggle={() => togglePlatform(p.platform.id)}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 p-4 rounded-xl border border-border/40 bg-muted/20 text-xs text-muted-foreground leading-relaxed animate-slide-up stagger-4 opacity-0">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/70" />
            <p>
              Compatibility estimates are based on detected project requirements and
              platform capabilities. Always verify current platform limits before
              deployment. Results are based on static analysis and may not capture
              all runtime behaviors.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 mt-8 mb-12 animate-slide-up stagger-5 opacity-0">
          <Link href="/analyze">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Analyze Another Project
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HostWhere — Know where your code can actually run.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ResultsNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Host<span className="gradient-text">Where</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/analyze">
            <Button size="sm" variant="outline" className="gap-2 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              New Analysis
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
