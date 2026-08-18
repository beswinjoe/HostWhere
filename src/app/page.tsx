import Link from "next/link";
import {
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Database,
  Globe,
  FileCode2,
  Server,
  Container,
  Zap,
  ArrowRight,
  ChevronDown,
  Clock,
  Shield,
  Code2,
  Box,
  Wifi,
  Timer,
  Settings,
  GitBranch,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────
// Landing Page
// ─────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
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
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              How it works
            </Link>
            <Link
              href="#platforms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Platforms
            </Link>
            <Link href="/analyze">
              <Button size="sm" className="gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Analyze Project
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-20 bg-grid overflow-hidden">
        {/* Gradient orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-border/60 bg-muted/50 text-xs text-muted-foreground">
            <Zap className="w-3 h-3 text-primary" />
            Free &amp; open-source project analyzer
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Know where your code
            <br />
            <span className="gradient-text glow-text">can actually run.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your project ZIP. HostWhere analyzes your stack, dependencies,
            and infrastructure requirements — then tells you which hosting
            platforms are compatible.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/analyze">
              <Button
                size="lg"
                className="gap-2 text-base px-8 h-12 glow cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload &amp; Analyze
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-base px-8 h-12 cursor-pointer"
              >
                See how it works
                <ChevronDown className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Example Result Preview */}
        <div className="relative mt-20 w-full max-w-2xl mx-auto animate-slide-up stagger-2 opacity-0">
          <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">
                discord-bot.zip — analysis result
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Vercel", status: "incompatible" as const },
                { name: "Railway", status: "compatible" as const },
                { name: "Netlify", status: "incompatible" as const },
                { name: "Render", status: "compatible" as const },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`rounded-lg border p-3 text-center ${
                    p.status === "compatible"
                      ? "status-bg-compatible"
                      : "status-bg-incompatible"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {p.status === "compatible" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 status-compatible" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 status-incompatible" />
                    )}
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-medium ${
                      p.status === "compatible"
                        ? "status-compatible"
                        : "status-incompatible"
                    }`}
                  >
                    {p.status === "compatible" ? "Compatible" : "Incompatible"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              Discord Gateway requires a persistent process. Serverless platforms
              not suitable.
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-24 px-6 border-t border-border/50"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Three simple steps. No account required. No data stored.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload your ZIP",
                description:
                  "Drop your project ZIP file. We support any framework — Next.js, Express, Flask, Django, Rails, and more.",
              },
              {
                step: "02",
                icon: Search,
                title: "We analyze everything",
                description:
                  "Our engine statically analyzes your code for framework, runtime, databases, WebSockets, workers, Docker, and 15+ other signals.",
              },
              {
                step: "03",
                icon: CheckCircle2,
                title: "See your results",
                description:
                  "Get instant compatibility results for 7 hosting platforms with detailed explanations and migration suggestions.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative group p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 hover:border-primary/20 transition-all duration-300"
              >
                <div className="text-xs font-mono text-primary/50 mb-4">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we detect */}
      <section className="py-24 px-6 border-t border-border/50 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              What we detect
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Deep static analysis across 15+ dimensions of your project.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: FileCode2, label: "Framework" },
              { icon: Code2, label: "Language" },
              { icon: Cpu, label: "Runtime" },
              { icon: Box, label: "Package Manager" },
              { icon: Settings, label: "Dependencies" },
              { icon: Terminal, label: "Build & Start Scripts" },
              { icon: Container, label: "Dockerfile" },
              { icon: Database, label: "Databases" },
              { icon: Wifi, label: "WebSockets" },
              { icon: Server, label: "Background Workers" },
              { icon: Timer, label: "Cron Jobs" },
              { icon: Clock, label: "Persistent Process" },
              { icon: Shield, label: "Env Variables" },
              { icon: GitBranch, label: "Monorepo" },
              { icon: Globe, label: "Static vs Dynamic" },
              { icon: Zap, label: "Serverless Compat" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/20 hover:bg-card/50 transition-colors"
              >
                <item.icon className="w-4 h-4 text-primary/70 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section id="platforms" className="py-24 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Supported platforms
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              We evaluate compatibility against 7 major hosting platforms.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                name: "Vercel",
                category: "Serverless",
                url: "vercel.com",
              },
              {
                name: "Netlify",
                category: "Serverless",
                url: "netlify.com",
              },
              {
                name: "Cloudflare Workers",
                category: "Edge Serverless",
                url: "workers.cloudflare.com",
              },
              {
                name: "Railway",
                category: "PaaS",
                url: "railway.app",
              },
              {
                name: "Render",
                category: "PaaS",
                url: "render.com",
              },
              {
                name: "Fly.io",
                category: "PaaS",
                url: "fly.io",
              },
              {
                name: "VPS / Docker",
                category: "Container / VPS",
                url: "docker.com",
              },
            ].map((p) => (
              <div
                key={p.name}
                className="p-4 rounded-xl border border-border/50 bg-card/30 hover:border-primary/20 hover:bg-card/60 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Server className="w-4 h-4 text-primary/70" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-border/50 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is my code safe?",
                a: "Absolutely. We perform static analysis only — your code is never executed, dependencies are never installed, and your ZIP is processed in memory and immediately discarded. Nothing is stored.",
              },
              {
                q: "How accurate are the results?",
                a: "Compatibility estimates are based on detected project requirements and platform capabilities. Our deterministic rules engine doesn't use AI for decisions — it's pure pattern matching. Always verify current platform limits before deployment.",
              },
              {
                q: "What frameworks are supported?",
                a: "We detect 25+ frameworks including Next.js, React, Vue, Nuxt, Svelte, SvelteKit, Angular, Astro, Express, Flask, Django, FastAPI, Rails, Laravel, and more. Static HTML sites are also fully supported.",
              },
              {
                q: "What file types should be in the ZIP?",
                a: "Include your project source files — package.json, requirements.txt, Dockerfile, source code, etc. We automatically skip node_modules, .git, dist, and other build artifacts.",
              },
              {
                q: "Is this free?",
                a: "Yes, HostWhere is completely free and open-source. No account required.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border/50 bg-card/30 transition-all hover:bg-card/50"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-sm">{item.q}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to find out where your project can run?
          </h2>
          <p className="text-muted-foreground mb-8">
            No sign-up. No tracking. Just answers.
          </p>
          <Link href="/analyze">
            <Button size="lg" className="gap-2 text-base px-8 h-12 glow cursor-pointer">
              <Upload className="w-4 h-4" />
              Analyze My Project
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary/70" />
            <span className="text-sm font-medium">HostWhere</span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Compatibility estimates are based on detected project requirements
            and platform capabilities. Always verify current platform limits
            before deployment.
          </p>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HostWhere
          </div>
        </div>
      </footer>
    </div>
  );
}
