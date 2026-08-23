import { redirect } from "next/navigation";
import { getAffiliateDashboardData } from "@/lib/affiliate/queries";
import { Navbar } from "@/components/landing/Navbar";
import { formatCentsToUSD, FEATURED_PLANS, type PlanType } from "@/lib/featured/types";
import {
  Sparkles,
  TrendingUp,
  MousePointerClick,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { CopyLinkButton } from "@/components/affiliate/CopyLinkButton";

export default async function AffiliateDashboardPage() {
  const data = await getAffiliateDashboardData();

  if (!data) {
    redirect("/login");
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-medium tracking-wide uppercase text-emerald-400">
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
            <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 w-full font-mono text-emerald-400 text-sm overflow-x-auto whitespace-nowrap">
              {referralLink}
            </div>
            <CopyLinkButton link={referralLink} />
          </div>
          <p className="text-sm text-neutral-400 mt-4">
            Share this link anywhere. Visitors get a 30-day tracking cookie. You earn 40% when they purchase a Featured Project plan.
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
          
          <div className="glass rounded-2xl p-6 border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent relative overflow-hidden">
            <div className="text-sm text-emerald-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Available
            </div>
            <div className="text-3xl font-bold text-white mb-4">{formatCentsToUSD(stats.availableCents)}</div>
            
            {/* Informational Manual Payout Section */}
            <div className="mt-4 pt-4 border-t border-emerald-500/20">
              <div className="flex items-start gap-2 text-xs text-emerald-500/80 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Payout requests will be available once the payout system is fully enabled. Currently, payouts are processed manually by the admin.
                </p>
              </div>
            </div>
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
      return <span className="text-neutral-400 text-sm font-medium justify-end">{status}</span>;
  }
}
