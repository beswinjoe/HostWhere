import Link from "next/link";
import { 
  ArrowRight, 
  ArrowDown,
  FileArchive,
  CheckCircle2,
  Cpu,
  Database,
  Container,
  Server,
  Zap,
  GitBranch,
  Settings,
  Shield,
  Box,
  Terminal,
  Wifi,
  FileCode2,
  XCircle
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden">
      <Navbar />

      {/* Global Background Grid & Glow */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-32 pb-24">
        
        {/* ─── Hero Section ────────────────────────────────────────────── */}
        <section className="px-6 flex flex-col items-center justify-center text-center max-w-5xl mx-auto mb-32 relative">
          <div className="hero-glow" />
          
          <div className="hero-animate hero-delay-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="HostWhere Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] font-medium tracking-wide uppercase text-neutral-300">
              Free & Open-Source Project Analyzer
            </span>
          </div>

          <h1 className="hero-animate hero-delay-2 font-display text-[clamp(3.5rem,7vw,7rem)] font-extrabold tracking-[-0.05em] leading-[0.95] mb-6">
            Know where your code <br />
            <span className="gradient-text">can actually run.</span>
          </h1>

          <p className="hero-animate hero-delay-3 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Upload your project ZIP. HostWhere analyzes your stack, dependencies, and infrastructure requirements — then tells you which hosting platforms are compatible.
          </p>

          <div className="hero-animate hero-delay-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/analyze" className="w-full sm:w-auto">
              <button className="cta-glow w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-semibold transition-all">
                Upload & Analyze
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-semibold text-white transition-all group arrow-hover">
                See how it works
                <ArrowDown className="w-4 h-4 text-neutral-400 arrow-icon" />
              </button>
            </a>
          </div>
        </section>

        {/* ─── Product Preview Section ─────────────────────────────────── */}
        <ScrollReveal className="px-6 mb-40">
          <div className="max-w-5xl mx-auto">
            <div className="glass rounded-2xl p-2 sm:p-4 overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <div className="bg-black/80 rounded-xl border border-white/10 overflow-hidden">
                {/* Fake browser header */}
                <div className="h-12 border-b border-white/10 flex items-center px-4 gap-4 bg-white/[0.02]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-neutral-800" />
                    <div className="w-3 h-3 rounded-full bg-neutral-800" />
                    <div className="w-3 h-3 rounded-full bg-neutral-800" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-neutral-400 font-mono flex items-center gap-2">
                      <FileArchive className="w-3 h-3 text-primary" />
                      discord-bot.zip — analysis result
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-10 grid md:grid-cols-2 gap-8 lg:gap-12 bg-grid" style={{ backgroundSize: '24px 24px' }}>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-6">Compatibility Overview</h3>
                    
                    <div className="platform-card flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold">Vercel</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">Incompatible</span>
                    </div>

                    <div className="platform-card flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-semibold">Railway</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Compatible</span>
                    </div>

                    <div className="platform-card flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 opacity-50">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold">Netlify</span>
                      </div>
                    </div>

                    <div className="platform-card flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 opacity-50">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-semibold">Render</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="relative">
                      {/* Connection line hidden on mobile */}
                      <div className="hidden md:block absolute top-1/2 -left-12 w-12 h-px bg-white/10" />
                      
                      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.05)]">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-red-500/10 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-red-400 mb-2">Blocker detected</h4>
                            <p className="text-sm text-neutral-300 leading-relaxed">
                              Discord Gateway requires a persistent process. Serverless platforms are not suitable.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ─── How It Works ────────────────────────────────────────────── */}
        <section id="how-it-works" className="px-6 mb-40 max-w-6xl mx-auto scroll-mt-24">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-[40px] md:text-[64px] font-extrabold tracking-[-0.035em] mb-4 leading-tight">How It Works</h2>
              <p className="text-neutral-400 text-lg">Three simple steps to infrastructure clarity.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <ScrollReveal delay={100}>
              <div className="glass p-8 rounded-3xl relative h-full">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10">
                  <span className="text-2xl font-bold text-neutral-500">01</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Drop your project ZIP file. We don&apos;t store your code, and the analysis runs entirely in memory.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="glass p-8 rounded-3xl relative h-full">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <span className="text-2xl font-bold text-primary">02</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Analyze</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Our engine scans your `package.json`, configuration files, and directory structure to understand your stack.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="glass p-8 rounded-3xl relative h-full">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10">
                  <span className="text-2xl font-bold text-neutral-500">03</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Know Where It Runs</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Get a detailed compatibility report across major hosting platforms, with specific blockers and warnings.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── Platforms ───────────────────────────────────────────────── */}
        <section id="platforms" className="px-6 mb-40 max-w-6xl mx-auto scroll-mt-24">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-[40px] md:text-[64px] font-extrabold tracking-[-0.035em] mb-4 leading-tight">Supported Platforms</h2>
              <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                We evaluate your project against the rules and limitations of the most popular modern hosting providers.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
              {['Vercel', 'Cloudflare', 'Railway', 'Render', 'Netlify', 'Fly.io', 'Docker', 'Zerops'].map((platform) => (
                <div key={platform} className="px-6 py-4 glass rounded-2xl font-semibold text-lg text-neutral-300 hover:text-white transition-colors cursor-default">
                  {platform}
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <a 
                href="mailto:support@hostwhere.com?subject=Platform%20Request" 
                className="text-sm text-neutral-500 hover:text-white transition-colors underline underline-offset-4 decoration-neutral-500/30 hover:decoration-white/50"
              >
                Don&apos;t see your hosting platform? Request a platform
              </a>
            </div>
          </ScrollReveal>
        </section>

        {/* ─── What We Detect ──────────────────────────────────────────── */}
        <section id="features" className="px-6 mb-40 max-w-6xl mx-auto scroll-mt-24">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-[40px] md:text-[64px] font-extrabold tracking-[-0.035em] mb-4 leading-tight">Comprehensive Analysis</h2>
              <p className="text-neutral-400 text-lg">Our 12 static analysis detectors leave no stone unturned.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: FileCode2, label: "Frameworks" },
              { icon: Cpu, label: "Runtimes" },
              { icon: Box, label: "Dependencies" },
              { icon: Terminal, label: "Versions" },
              { icon: Server, label: "Persistent processes" },
              { icon: Database, label: "Databases" },
              { icon: Shield, label: "Environment variables" },
              { icon: Wifi, label: "Ports" },
              { icon: Container, label: "Docker configs" },
              { icon: Settings, label: "Build commands" },
              { icon: Zap, label: "Serverless compatibility" },
              { icon: GitBranch, label: "Background workers" },
            ].map((feature, i) => (
              <ScrollReveal key={feature.label} delay={i * 50}>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <feature.icon className="w-5 h-5 text-primary/70 shrink-0" />
                  <span className="text-sm font-medium text-neutral-300">{feature.label}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ─── Final CTA ───────────────────────────────────────────────── */}
        <section className="px-6 max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="p-12 md:p-20 rounded-3xl glass text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
              <div className="relative z-10">
                <h2 className="font-display text-[40px] md:text-[64px] font-extrabold tracking-[-0.035em] mb-6 leading-tight">
                  Stop guessing where your project can run.
                </h2>
                <p className="text-xl text-neutral-400 mb-10 font-light">
                  Analyze it before you deploy.
                </p>
                <Link href="/analyze">
                  <button className="cta-glow inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-black hover:bg-neutral-200 rounded-full text-lg font-bold transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] arrow-hover">
                    Analyze My Project
                    <ArrowRight className="w-5 h-5 arrow-icon" />
                  </button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>

      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-12 px-6 relative z-10 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center bg-white/[0.06] border border-white/[0.08]">
              <img src="/logo.png" alt="HostWhere Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-400">
              HostWhere
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} HostWhere. Free and open-source project analyzer.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Quick inline icon component to avoid one more import up top
function ScanLine(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" x2="21" y1="12" y2="12" />
      <line x1="3" x2="21" y1="6" y2="6" />
      <line x1="3" x2="21" y1="18" y2="18" />
    </svg>
  );
}
