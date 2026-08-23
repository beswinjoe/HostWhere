import { getAffiliateDashboardData } from "@/lib/affiliate/queries";
import { Navbar } from "@/components/landing/Navbar";
import Link from "next/link";
import { formatCentsToUSD, FEATURED_PLANS, type PlanType } from "@/lib/featured/types";
import {
  Sparkles,
  TrendingUp,
  MousePointerClick,
  Users,
  Copy,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { CopyLinkButton } from "@/components/affiliate/CopyLinkButton";

export default async function AffiliatePage() {
  const data = await getAffiliateDashboardData();

  if (!data) {
    return <AffiliateLandingPage />;
  }

  const { username, stats, recentCommissions } = data;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hostwhere.com";
  const referralLink = `${baseUrl}/r/${username}`;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-28 pb-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12 hero-animate">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-medium tracking-wide uppercase text-primary">
              Partner Program
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Affiliate Dashboard
          </h1>
          <p className="text-lg text-neutral-400">
            Track your referrals, conversions, and 40% commissions.
          </p>
        </div>

        {/* Link Box */}
        <div className="glass rounded-3xl p-8 mb-12 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 w-full font-mono text-primary text-sm overflow-x-auto whitespace-nowrap">
              {referralLink}
            </div>
            <CopyLinkButton link={referralLink} />
          </div>
          <p className="text-sm text-neutral-400 mt-4">
            Share this link anywhere. Visitors get a 30-day tracking cookie. You earn 40% when they feature a project.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            delay={200}
            title="Total Clicks"
            value={stats.totalClicks}
            icon={<MousePointerClick className="w-5 h-5 text-blue-400" />}
            gradient="from-blue-500/10 to-blue-500/5"
            border="border-blue-500/20"
          />
          <StatCard
            delay={300}
            title="Signups"
            value={stats.totalReferrals}
            icon={<Users className="w-5 h-5 text-purple-400" />}
            gradient="from-purple-500/10 to-purple-500/5"
            border="border-purple-500/20"
          />
          <StatCard
            delay={400}
            title="Conversions"
            value={stats.totalConversions}
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            gradient="from-emerald-500/10 to-emerald-500/5"
            border="border-emerald-500/20"
          />
          <StatCard
            delay={500}
            title="Total Earned"
            value={formatCentsToUSD(stats.totalCents)}
            icon={<Wallet className="w-5 h-5 text-amber-400" />}
            gradient="from-amber-500/10 to-amber-500/5"
            border="border-amber-500/20"
          />
        </div>

        {/* Earnings Split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up" style={{ animationDelay: "600ms" }}>
          <div className="glass rounded-2xl p-6 border-white/5">
            <div className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending
            </div>
            <div className="text-3xl font-bold">{formatCentsToUSD(stats.pendingCents)}</div>
            <p className="text-xs text-neutral-500 mt-2">Available 30 days after purchase</p>
          </div>
          <div className="glass rounded-2xl p-6 border-emerald-500/20 bg-emerald-500/5">
            <div className="text-sm text-emerald-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Available
            </div>
            <div className="text-3xl font-bold text-white">{formatCentsToUSD(stats.availableCents)}</div>
            <p className="text-xs text-emerald-500/60 mt-2">Ready for manual payout</p>
          </div>
          <div className="glass rounded-2xl p-6 border-white/5">
            <div className="text-sm text-neutral-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Paid
            </div>
            <div className="text-3xl font-bold">{formatCentsToUSD(stats.paidCents)}</div>
            <p className="text-xs text-neutral-500 mt-2">Historically paid out to you</p>
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="glass rounded-3xl p-8 animate-slide-up" style={{ animationDelay: "700ms" }}>
          <h2 className="text-xl font-bold mb-6">Recent Conversions</h2>
          
          {recentCommissions.length === 0 ? (
            <div className="text-center py-12 border border-white/5 rounded-2xl bg-black/20">
              <TrendingUp className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400">No conversions yet.</p>
              <p className="text-sm text-neutral-500 mt-1">Share your link to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCommissions.map((commission) => {
                const planName = FEATURED_PLANS[commission.plan as PlanType]?.name || commission.plan;
                return (
                  <div key={commission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Someone purchased {planName}</span>
                      </div>
                      <div className="text-sm text-neutral-400">
                        {new Date(commission.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 sm:justify-end">
                      <div className="text-right">
                        <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-0.5">Commission</div>
                        <div className="font-bold text-emerald-400">{formatCentsToUSD(commission.commission_amount_cents)}</div>
                      </div>
                      
                      <div className="text-right w-24">
                        <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-0.5">Status</div>
                        <StatusBadge status={commission.status} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  border: string;
  delay: number;
}

function StatCard({ title, value, icon, gradient, border, delay }: StatCardProps) {
  return (
    <div className={`glass rounded-2xl p-6 border ${border} bg-gradient-to-br ${gradient} animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-neutral-400 text-sm font-semibold uppercase tracking-wider mb-1">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <span className="text-amber-400 text-sm font-medium flex items-center gap-1 justify-end"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    case "available":
      return <span className="text-emerald-400 text-sm font-medium flex items-center gap-1 justify-end"><CheckCircle2 className="w-3.5 h-3.5" /> Available</span>;
    case "paid":
      return <span className="text-blue-400 text-sm font-medium flex items-center gap-1 justify-end"><Wallet className="w-3.5 h-3.5" /> Paid</span>;
    case "reversed":
    case "cancelled":
      return <span className="text-red-400 text-sm font-medium flex items-center gap-1 justify-end"><XCircle className="w-3.5 h-3.5" /> {status}</span>;
    default:
      return <span className="text-neutral-400 text-sm font-medium">{status}</span>;
  }
}

function AffiliateLandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-8 hero-animate">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-medium tracking-wide uppercase text-primary">
            HostWhere Partners
          </span>
        </div>

        <h1 className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 hero-animate" style={{ animationDelay: "100ms" }}>
          Earn <span className="text-emerald-400">40%</span> by referring creators.
        </h1>
        
        <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto hero-animate leading-relaxed" style={{ animationDelay: "200ms" }}>
          Join the HostWhere Partner Program. Share your unique link, help creators discover the best hosting for their projects, and earn a generous 40% commission on all Featured Project placements.
        </p>

        <div className="hero-animate" style={{ animationDelay: "300ms" }}>
          <Link href="/signup">
            <button className="cta-glow px-8 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-bold text-lg transition-all flex items-center gap-2 mx-auto">
              Start Earning Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <p className="mt-4 text-sm text-neutral-500">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Log in to view your dashboard</Link>
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 mt-24 hero-animate" style={{ animationDelay: "400ms" }}>
          <div className="glass p-8 rounded-3xl text-left border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Copy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">1. Share Your Link</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Get a unique referral link automatically when you create an account.</p>
          </div>
          <div className="glass p-8 rounded-3xl text-left border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">2. Creators Feature Projects</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Visitors discover HostWhere and purchase Featured placement plans.</p>
          </div>
          <div className="glass p-8 rounded-3xl text-left border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
              <Wallet className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">3. Earn 40%</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">You get 40% of the sale. Monitor your earnings directly in the dashboard.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
