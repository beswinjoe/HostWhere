import Link from "next/link";
import { 
  ArrowRight, 
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  Zap,
  Star,
  Crown,
  Share2,
  BarChart,
  Globe,
  Coins
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { HomepageFeaturedProjects } from "@/components/featured/HomepageFeaturedProjects";
import { RecentlyAnalyzed } from "@/components/landing/RecentlyAnalyzed";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden">
      <Navbar />

      {/* Global Background Grid & Glow */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-32 pb-24">
        
        {/* ─── SECTION 1: HERO ────────────────────────────────────────────── */}
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
            Know where your project <br />
            <span className="gradient-text">belongs.</span>
          </h1>

          <p className="hero-animate hero-delay-3 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Analyze your GitHub repositories or ZIP uploads in seconds. HostWhere automatically detects your tech stack and recommends the best modern hosting platforms.
          </p>

          <div className="hero-animate hero-delay-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/analyze" className="w-full sm:w-auto">
              <button className="cta-glow w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-semibold transition-all">
                Analyze Your Project
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

        {/* ─── SECTION 2: FEATURED PROJECTS ───────────────────────────────── */}
        <HomepageFeaturedProjects />

        {/* ─── SECTION 3: RECENTLY ANALYZED ───────────────────────────────── */}
        <RecentlyAnalyzed />

        {/* ─── SECTION 4: HOW HOSTWHERE WORKS ─────────────────────────────── */}
        <section id="how-it-works" className="px-6 mb-40 max-w-6xl mx-auto scroll-mt-24">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-[40px] md:text-[64px] font-extrabold tracking-[-0.035em] mb-4 leading-tight">How It Works</h2>
              <p className="text-neutral-400 text-lg max-w-2xl mx-auto">From code to community in three simple steps.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <ScrollReveal delay={100}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10">
                  <BarChart className="w-10 h-10 text-neutral-300" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Analyze</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Paste a GitHub URL or upload your project. We scan your code to understand exactly what you are building.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <Globe className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Discover</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Understand your project requirements and discover exactly where it can run across modern hosting platforms.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                  <Star className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Promote</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Feature your project and get visibility on the HostWhere leaderboard in front of thousands of developers.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── SECTION 5: FEATURED PROJECT PLANS ──────────────────────────── */}
        <section className="px-6 mb-40 max-w-6xl mx-auto scroll-mt-24">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-display text-[40px] md:text-[64px] font-extrabold tracking-[-0.035em] mb-4 leading-tight">Get Discovered</h2>
              <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                Promote your project to the HostWhere community. Active Featured Projects appear on the homepage and rank higher across the platform.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Boost Plan */}
            <ScrollReveal delay={100}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:bg-white/[0.04]">
                <div className="mb-6 flex items-center gap-3 text-emerald-400">
                  <Zap className="w-8 h-8" />
                  <h3 className="text-2xl font-bold text-white">Boost</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">$2</span>
                  <span className="text-neutral-400 uppercase font-bold tracking-wider text-sm">/ 7 Days</span>
                </div>
                <p className="text-neutral-400 mb-8 flex-grow">
                  Get your project featured on HostWhere for 7 days. Perfect for quick visibility.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority Level 1
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Appears on Leaderboard
                  </li>
                </ul>
                <Link href="/analyze" className="mt-auto">
                  <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all">
                    Choose Plan
                  </button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Featured Plan */}
            <ScrollReveal delay={200}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent shadow-[0_0_50px_rgba(245,158,11,0.05)] transform md:-translate-y-4">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-black">
                  Most Popular
                </span>
                <div className="mb-6 flex items-center gap-3 text-amber-400">
                  <Star className="w-8 h-8" />
                  <h3 className="text-2xl font-bold text-white">Featured</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">$5</span>
                  <span className="text-amber-500/80 uppercase font-bold tracking-wider text-sm">/ 14 Days</span>
                </div>
                <p className="text-neutral-300 mb-8 flex-grow">
                  Get higher visibility on HostWhere for 14 days. Our most popular option for serious creators.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" /> Priority Level 2
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" /> Higher Leaderboard Ranking
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" /> Homepage Eligible
                  </li>
                </ul>
                <Link href="/analyze" className="mt-auto">
                  <button className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    Choose Plan
                  </button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Spotlight Plan */}
            <ScrollReveal delay={300}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:bg-white/[0.04]">
                <div className="mb-6 flex items-center gap-3 text-cyan-400">
                  <Crown className="w-8 h-8" />
                  <h3 className="text-2xl font-bold text-white">Spotlight</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">$10</span>
                  <span className="text-neutral-400 uppercase font-bold tracking-wider text-sm">/ 30 Days</span>
                </div>
                <p className="text-neutral-400 mb-8 flex-grow">
                  Premium visibility and top placement on HostWhere for 30 days. Maximize your project&apos;s reach.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500" /> Priority Level 3 (Maximum)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500" /> Top Leaderboard Ranking
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500" /> Priority Homepage Placement
                  </li>
                </ul>
                <Link href="/analyze" className="mt-auto">
                  <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all">
                    Choose Plan
                  </button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ─── SECTION 6: AFFILIATE PROGRAM ───────────────────────────────── */}
        <section className="px-6 mb-40 max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="glass rounded-3xl p-10 md:p-16 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="md:w-1/2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                  <Coins className="w-3.5 h-3.5" />
                  Partnership
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                  Share HostWhere.<br/>
                  <span className="text-emerald-400">Earn 40%.</span>
                </h2>
                <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
                  Refer creators to HostWhere and earn 40% commission on every eligible Featured Project purchase they make.
                </p>
                <Link href="/affiliate">
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-bold transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    Join the Affiliate Program
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="md:w-1/2 w-full relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/50 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Share your link</h4>
                    <p className="text-xs text-neutral-500">Get your unique referral URL</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/50 border border-white/5 ml-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">They Promote</h4>
                    <p className="text-xs text-neutral-500">Creators feature their projects</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 ml-8">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-400">You Earn 40%</h4>
                    <p className="text-xs text-emerald-500/70">Commission credited instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ─── SECTION 7: WHY HOSTWHERE ───────────────────────────────────── */}
        <section className="px-6 mb-32 max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-b border-white/10 py-12">
              <div>
                <h4 className="text-2xl font-bold text-white mb-2">Analyze</h4>
                <p className="text-sm text-neutral-500">Understand your project.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-primary mb-2">Discover</h4>
                <p className="text-sm text-neutral-500">Explore the community.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-amber-400 mb-2">Promote</h4>
                <p className="text-sm text-neutral-500">Gain massive visibility.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-emerald-400 mb-2">Earn</h4>
                <p className="text-sm text-neutral-500">Refer & get 40%.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ─── Final CTA ──────────────────────────────────────────────────── */}
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

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
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
