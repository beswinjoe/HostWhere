import Link from "next/link";
import { 
  ArrowRight, 
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Zap,
  Star,
  Crown,
  Share2,
  BarChart,
  Globe,
  Coins,
  UserCircle,
  Layers
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { HomepageFeaturedProjects } from "@/components/featured/HomepageFeaturedProjects";
import { RecentlyAnalyzed } from "@/components/landing/RecentlyAnalyzed";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-blue-100 relative overflow-hidden">
      <Navbar />

      {/* Global Background Grid & Glow */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-100" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-32 pb-24">
        
        {/* ─── SECTION 1: HERO ────────────────────────────────────────────── */}
        <section className="px-6 flex flex-col items-center justify-center text-center max-w-5xl mx-auto mb-32 relative">
          <div className="hero-glow" />
          
          <div className="hero-animate hero-delay-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 bg-neutral-100 backdrop-blur-md mb-8">
            <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center bg-white border border-neutral-200">
              <img src="/logo.png" alt="HostWhere Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] font-medium tracking-wide uppercase text-neutral-700">
              Free & Open-Source Project Analyzer
            </span>
          </div>

          <h1 className="hero-animate hero-delay-2 font-display text-[clamp(3.5rem,7vw,7rem)] font-extrabold tracking-[-0.05em] leading-[0.95] mb-6">
            Know where your project <br />
            <span className="gradient-text">belongs.</span>
          </h1>

          <p className="hero-animate hero-delay-3 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Analyze your GitHub repositories or ZIP uploads in seconds. HostWhere automatically detects your tech stack and recommends the best modern hosting platforms.
          </p>

          <div className="hero-animate hero-delay-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/analyze" className="w-full sm:w-auto">
              <button className="cta-glow w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-full font-semibold transition-all">
                Analyze Your Project
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-full font-semibold text-neutral-700 transition-all group arrow-hover">
                See how it works
                <ArrowDown className="w-4 h-4 text-neutral-500 arrow-icon" />
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
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">From code to community in three simple steps.</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

            <ScrollReveal delay={100}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-8 relative z-10">
                  <BarChart className="w-10 h-10 text-neutral-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Analyze</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Paste a GitHub URL or upload your project. We scan your code to understand exactly what you are building.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-8 relative z-10 shadow-sm">
                  <Globe className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Discover</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Understand your project requirements and discover exactly where it can run across modern hosting platforms.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-8 relative z-10">
                  <Star className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Promote</h3>
                <p className="text-neutral-600 leading-relaxed">
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
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
                Promote your project to the HostWhere community. Active Featured Projects appear on the homepage and rank higher across the platform.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Boost Plan */}
            <ScrollReveal delay={100}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col border border-neutral-200 hover:border-blue-300 transition-all hover:bg-blue-50/50 shadow-sm">
                <div className="mb-6 flex items-center gap-3 text-blue-500">
                  <Zap className="w-8 h-8" />
                  <h3 className="text-2xl font-bold text-neutral-900">Boost</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6 text-neutral-900">
                  <span className="text-4xl font-extrabold">$2</span>
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-sm">/ 7 Days</span>
                </div>
                <p className="text-neutral-600 mb-8 flex-grow">
                  Get your project featured on HostWhere for 7 days. Perfect for quick visibility.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-neutral-400 shrink-0" /> Priority Level 1
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-neutral-400 shrink-0" /> Appears on Leaderboard
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-500">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" /> Editable Project Profile
                  </li>
                </ul>
                <Link href="/analyze" className="mt-auto">
                  <button className="w-full py-4 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 font-semibold transition-all">
                    Choose Plan
                  </button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Featured Plan */}
            <ScrollReveal delay={200}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col border border-amber-200 bg-gradient-to-b from-amber-50 shadow-md transform md:-translate-y-4">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  Most Popular
                </span>
                <div className="mb-6 flex items-center gap-3 text-amber-500">
                  <Star className="w-8 h-8" />
                  <h3 className="text-2xl font-bold text-neutral-900">Featured</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6 text-neutral-900">
                  <span className="text-4xl font-extrabold">$5</span>
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-sm">/ 14 Days</span>
                </div>
                <p className="text-neutral-600 mb-8 flex-grow">
                  Get higher visibility on HostWhere for 14 days. Our most popular option for serious creators.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Priority Level 2
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Higher Leaderboard Ranking
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Homepage Eligible
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" /> Editable Project Profile
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-600 pl-2">
                    <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Add Website &amp; Live Demo Links
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-600 pl-2">
                    <UserCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Add Creator / Company Name
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-600 pl-2">
                    <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Add Category &amp; Project Details
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-600 pl-2">
                    <Share2 className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Add Social Media Links
                  </li>
                </ul>
                <Link href="/analyze" className="mt-auto">
                  <button className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-sm">
                    Choose Plan
                  </button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Spotlight Plan */}
            <ScrollReveal delay={300}>
              <div className="glass p-8 rounded-3xl relative h-full flex flex-col border border-purple-300 hover:border-purple-400 transition-all shadow-lg">
                <div className="mb-6 flex items-center gap-3 text-purple-600">
                  <Crown className="w-8 h-8" />
                  <h3 className="text-2xl font-bold text-neutral-900">Spotlight</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6 text-neutral-900">
                  <span className="text-4xl font-extrabold">$10</span>
                  <span className="text-neutral-500 uppercase font-bold tracking-wider text-sm">/ 30 Days</span>
                </div>
                <p className="text-neutral-600 mb-8 flex-grow">
                  Premium visibility and top placement on HostWhere for 30 days. Maximize your project&apos;s reach.
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Priority Level 3 (Maximum)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Top Leaderboard Ranking
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Priority Homepage Placement
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> Premium Editable Project Profile
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-600 pl-2">
                    <Globe className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Add Website &amp; Live Demo Links
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-600 pl-2">
                    <UserCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Add Creator / Company Name
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-600 pl-2">
                    <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Add Category &amp; Project Details
                  </li>
                  <li className="flex items-center gap-3 text-sm text-neutral-600 pl-2">
                    <Share2 className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Add Social Media Links
                  </li>
                </ul>
                <Link href="/analyze" className="mt-auto">
                  <button className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all shadow-sm">
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
            <div className="glass rounded-3xl p-10 md:p-16 border border-neutral-200 bg-gradient-to-br from-blue-50 via-transparent to-transparent relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="md:w-1/2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6">
                  <Coins className="w-3.5 h-3.5" />
                  Partnership
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                  Share HostWhere.<br/>
                  <span className="text-blue-600">Earn 40%.</span>
                </h2>
                <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                  Refer creators to HostWhere and earn 40% commission on every eligible Featured Project purchase they make.
                </p>
                <Link href="/affiliate">
                  <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-sm">
                    Join the Affiliate Program
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="md:w-1/2 w-full relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Share your link</h4>
                    <p className="text-xs text-neutral-500">Get your unique referral URL</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm ml-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">They Promote</h4>
                    <p className="text-xs text-neutral-500">Creators feature their projects</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-md ml-8">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-blue-900">You Earn 40%</h4>
                    <p className="text-xs text-blue-700">Commission credited instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ─── SECTION 7: WHY HOSTWHERE ───────────────────────────────────── */}
        <section className="px-6 mb-32 max-w-5xl mx-auto text-center">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-b border-neutral-200 py-12">
              <div>
                <h4 className="text-2xl font-bold text-neutral-900 mb-2">Analyze</h4>
                <p className="text-sm text-neutral-500">Understand your project.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-neutral-900 mb-2">Discover</h4>
                <p className="text-sm text-neutral-500">Explore the community.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-neutral-900 mb-2">Promote</h4>
                <p className="text-sm text-neutral-500">Gain massive visibility.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-neutral-900 mb-2">Earn</h4>
                <p className="text-sm text-neutral-500">Refer & get 40%.</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ─── Final CTA ──────────────────────────────────────────────────── */}
        <section className="px-6 max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="p-12 md:p-20 rounded-3xl glass text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-50" />
              <div className="relative z-10">
                <h2 className="font-display text-[40px] md:text-[64px] font-extrabold tracking-[-0.035em] mb-6 leading-tight">
                  Stop guessing where your project can run.
                </h2>
                <p className="text-xl text-neutral-600 mb-10 font-light">
                  Analyze it before you deploy.
                </p>
                <Link href="/analyze">
                  <button className="cta-glow inline-flex items-center justify-center gap-2 px-10 py-5 bg-blue-600 text-white hover:bg-blue-700 rounded-full text-lg font-bold transition-all shadow-sm arrow-hover">
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
      <footer className="border-t border-neutral-200 py-12 px-6 relative z-10 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md overflow-hidden flex items-center justify-center bg-neutral-100 border border-neutral-200">
              <img src="/logo.png" alt="HostWhere Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-600">
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
