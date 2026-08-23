import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Navbar } from "@/components/landing/Navbar";
import {
  Sparkles,
  TrendingUp,
  Copy,
  Wallet,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from "lucide-react";

export default async function AffiliateLandingPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const ctaLink = isAuthenticated ? "/affiliate/dashboard" : "/signup";
  const ctaText = isAuthenticated ? "Go to Dashboard" : "Become an Affiliate";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 relative overflow-hidden">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-5xl mx-auto">
        {/* ─── Hero Section ─────────────────────────────────────────────── */}
        <section className="text-center mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md mb-8 hero-animate">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-medium tracking-wide uppercase text-emerald-400">
              HostWhere Partners
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-6 hero-animate" style={{ animationDelay: "100ms" }}>
            Earn <span className="text-emerald-400">40%</span> with HostWhere.
          </h1>
          
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto hero-animate leading-relaxed font-light" style={{ animationDelay: "200ms" }}>
            Share HostWhere with creators and developers. Earn a massive 40% commission when your referrals purchase eligible Featured Project plans.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 hero-animate" style={{ animationDelay: "300ms" }}>
            <Link href={ctaLink} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                {ctaText}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-semibold transition-all">
                Learn How It Works
              </button>
            </a>
          </div>
        </section>

        {/* ─── How It Works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="mb-40 scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-4">A simple, transparent flow.</h2>
            <p className="text-neutral-400">Three steps to start earning recurring commissions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

            <div className="glass p-8 rounded-3xl text-center border-white/5 relative z-10 hover:bg-white/[0.02] transition-colors">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Copy className="w-8 h-8 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Get Your Link</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Create an account to instantly generate your unique HostWhere referral link.
              </p>
            </div>
            
            <div className="glass p-8 rounded-3xl text-center border-white/5 relative z-10 hover:bg-white/[0.02] transition-colors">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Share HostWhere</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Share HostWhere with creators, developers, and project owners. Visitors are tracked for 30 days.
              </p>
            </div>
            
            <div className="glass p-8 rounded-3xl text-center border-emerald-500/20 bg-emerald-500/5 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Wallet className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">3. Earn 40%</h3>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Earn 40% commission on every eligible successful Featured Project purchase.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Commission Examples ───────────────────────────────────────── */}
        <section className="mb-40">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-4">What you can earn.</h2>
            <p className="text-neutral-400">Clear, fixed 40% rates on all eligible plans.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-8 rounded-3xl border border-white/10">
              <div className="text-neutral-400 uppercase tracking-widest text-xs font-bold mb-4">Boost Plan</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-neutral-500 line-through decoration-neutral-500/50">$2</span>
                <span className="text-sm text-neutral-500">purchase</span>
              </div>
              <div className="pt-4 mt-4 border-t border-white/10">
                <div className="text-sm text-emerald-500 font-medium mb-1">You earn</div>
                <div className="text-4xl font-extrabold text-emerald-400">$0.80</div>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 transform md:-translate-y-4">
              <div className="text-emerald-400 uppercase tracking-widest text-xs font-bold mb-4">Featured Plan</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-neutral-500 line-through decoration-neutral-500/50">$5</span>
                <span className="text-sm text-neutral-500">purchase</span>
              </div>
              <div className="pt-4 mt-4 border-t border-emerald-500/20">
                <div className="text-sm text-emerald-500 font-medium mb-1">You earn</div>
                <div className="text-4xl font-extrabold text-emerald-400">$2.00</div>
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10">
              <div className="text-neutral-400 uppercase tracking-widest text-xs font-bold mb-4">Spotlight Plan</div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-semibold text-neutral-500 line-through decoration-neutral-500/50">$10</span>
                <span className="text-sm text-neutral-500">purchase</span>
              </div>
              <div className="pt-4 mt-4 border-t border-white/10">
                <div className="text-sm text-emerald-500 font-medium mb-1">You earn</div>
                <div className="text-4xl font-extrabold text-emerald-400">$4.00</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Status Flow ──────────────────────────────────────────────── */}
        <section className="mb-40 max-w-4xl mx-auto">
          <div className="glass p-10 rounded-3xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-10 text-center">Payout Lifecycle</h2>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-1">Pending</h4>
                <p className="text-xs text-neutral-400">Held for 30 days to prevent refunds or fraud.</p>
              </div>
              
              <div className="hidden md:block w-8 h-px bg-white/20" />
              
              <div className="flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-1">Available</h4>
                <p className="text-xs text-neutral-400">Funds have cleared the holding period.</p>
              </div>
              
              <div className="hidden md:block w-8 h-px bg-white/20" />
              
              <div className="flex-1 flex flex-col items-center text-center opacity-70">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-1">Request Payout</h4>
                <p className="text-xs text-neutral-400">Currently processed manually upon request.</p>
              </div>
              
              <div className="hidden md:block w-8 h-px bg-white/20 opacity-70" />
              
              <div className="flex-1 flex flex-col items-center text-center opacity-70">
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-4">
                  <Wallet className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-1">Paid</h4>
                <p className="text-xs text-neutral-400">Commission has been successfully sent to you.</p>
              </div>
            </div>

            <div className="mt-12 p-4 bg-white/[0.03] border border-white/10 rounded-xl text-center">
              <p className="text-sm text-neutral-400 flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4 text-neutral-500" />
                Note: Automated payouts via Stripe/PayPal are not yet enabled. Payouts are manually reviewed and processed by admin.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section className="mb-32 max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-extrabold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border-white/5">
              <h4 className="font-bold text-lg mb-2 text-white">Who can join the affiliate program?</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Anyone with a HostWhere account! As soon as you sign up, your unique referral link is generated and ready to use in your dashboard.
              </p>
            </div>
            
            <div className="glass p-6 rounded-2xl border-white/5">
              <h4 className="font-bold text-lg mb-2 text-white">How much commission do I earn?</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                You earn a flat 40% commission on every eligible purchase. For example, a $10 Spotlight plan earns you $4.00.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border-white/5">
              <h4 className="font-bold text-lg mb-2 text-white">When does commission become available?</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                To protect against fraud and refunds, all commissions remain in a &quot;Pending&quot; state for 30 days after the purchase. Once cleared, they become &quot;Available&quot;.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border-white/5">
              <h4 className="font-bold text-lg mb-2 text-white">How do payouts work?</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Currently, payouts are handled manually by the HostWhere admin team. Automated self-serve payouts are on our roadmap.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border-white/5">
              <h4 className="font-bold text-lg mb-2 text-white">Can I refer myself?</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                No, self-referrals are strictly prohibited. The system will not generate commissions if the buyer and the affiliate are the same user.
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border-white/5">
              <h4 className="font-bold text-lg mb-2 text-white">Which purchases are eligible?</h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Any successful purchase of the Boost, Featured, or Spotlight plans made by a user within 30 days of clicking your referral link.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA ───────────────────────────────────────────────── */}
        <section className="text-center">
          <Link href={ctaLink}>
            <button className="cta-glow px-10 py-5 bg-white text-black hover:bg-neutral-200 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 mx-auto">
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </section>

      </main>
    </div>
  );
}
