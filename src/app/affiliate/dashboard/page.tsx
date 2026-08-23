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
} from "lucide-react";
import { CopyLinkButton } from "@/components/affiliate/CopyLinkButton";
import { RequestPayoutModal } from "@/components/affiliate/RequestPayoutModal";

export default async function AffiliateDashboardPage() {
  const data = await getAffiliateDashboardData();

  if (!data) {
    redirect("/login");
  }

  const { username, stats, recentCommissions, payoutHistory } = data;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hostwhere.com";
  const referralLink = `${baseUrl}/r/${username}`;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-emerald-100 relative overflow-hidden">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-100" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-emerald-50/50 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 pt-28 pb-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12 hero-animate">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 backdrop-blur-md mb-6">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-medium tracking-wide uppercase text-emerald-800">
              Partner Program
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Affiliate Dashboard
          </h1>
          <p className="text-lg text-neutral-600">
            Track your referrals, conversions, and 40% commissions.
          </p>
        </div>

        {/* Link Box */}
        <div className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-8 mb-12 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 w-full font-mono text-neutral-900 text-sm overflow-x-auto whitespace-nowrap">
              {referralLink}
            </div>
            <CopyLinkButton link={referralLink} />
          </div>
          <p className="text-sm text-neutral-600 mt-4">
            Share this link anywhere. Visitors get a 30-day tracking cookie. You earn 40% when they purchase a Featured Project plan.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            delay={200}
            title="Total Clicks"
            value={stats.totalClicks}
            icon={<MousePointerClick className="w-5 h-5 text-emerald-600" />}
            gradient="from-emerald-50 to-white"
            border="border-neutral-200"
          />
          <StatCard
            delay={300}
            title="Signups"
            value={stats.totalReferrals}
            icon={<Users className="w-5 h-5 text-emerald-600" />}
            gradient="from-emerald-50 to-white"
            border="border-neutral-200"
          />
          <StatCard
            delay={400}
            title="Conversions"
            value={stats.totalConversions}
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            gradient="from-emerald-50 to-white"
            border="border-neutral-200"
          />
          <StatCard
            delay={500}
            title="Total Earned"
            value={formatCentsToUSD(stats.totalCents)}
            icon={<Wallet className="w-5 h-5 text-emerald-700" />}
            gradient="from-emerald-100 to-emerald-50"
            border="border-emerald-200"
          />
        </div>

        {/* Earnings Split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up" style={{ animationDelay: "600ms" }}>
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
            <div className="text-sm text-neutral-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending
            </div>
            <div className="text-3xl font-bold text-neutral-900">{formatCentsToUSD(stats.pendingCents)}</div>
            <p className="text-xs text-neutral-500 mt-2">Available 30 days after purchase</p>
          </div>
          
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-300 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="text-sm text-emerald-800 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Available
              </div>
              <div className="text-3xl font-bold text-emerald-900 mb-4">{formatCentsToUSD(stats.availableCents)}</div>
            </div>
            
            <RequestPayoutModal availableCents={stats.availableCents} />
          </div>

          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
            <div className="text-sm text-neutral-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Paid
            </div>
            <div className="text-3xl font-bold text-neutral-900">{formatCentsToUSD(stats.paidCents)}</div>
            <p className="text-xs text-neutral-500 mt-2">Historically paid out to you</p>
          </div>
        </div>

        {/* Recent Conversions & Payouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Conversions */}
          <div className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-8 animate-slide-up" style={{ animationDelay: "700ms" }}>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Recent Conversions</h2>
            
            {recentCommissions.length === 0 ? (
              <div className="text-center py-12 border border-neutral-200 rounded-2xl bg-neutral-50">
                <TrendingUp className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No conversions yet.</p>
                <p className="text-sm text-neutral-500 mt-1">Share your link to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCommissions.map((commission) => {
                  const planName = FEATURED_PLANS[commission.plan as PlanType]?.name || commission.plan;
                  return (
                    <div key={commission.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-200 hover:bg-neutral-50 shadow-sm transition-colors gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-neutral-900 text-sm">{planName}</span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-0.5">Comm.</div>
                          <div className="font-bold text-neutral-900 text-sm">{formatCentsToUSD(commission.commission_amount_cents)}</div>
                        </div>
                        
                        <div className="text-right min-w-[70px]">
                          <StatusBadge status={commission.status} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payout History */}
          <div className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-8 animate-slide-up" style={{ animationDelay: "800ms" }}>
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Payout History</h2>
            
            {(!payoutHistory || payoutHistory.length === 0) ? (
              <div className="text-center py-12 border border-neutral-200 rounded-2xl bg-neutral-50">
                <Wallet className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No payouts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payoutHistory.map((payout: {
                  id: string;
                  payout_method: string;
                  created_at: string;
                  amount_cents: number;
                  status: string;
                }) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm gap-4">
                    <div>
                      <div className="font-semibold text-neutral-900 text-sm capitalize">{payout.payout_method}</div>
                      <div className="text-xs text-neutral-500">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-neutral-900 text-sm">{formatCentsToUSD(payout.amount_cents)}</div>
                      </div>
                      <div className="text-right min-w-[70px]">
                        <StatusBadge status={payout.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
    <div className={`bg-white rounded-2xl p-6 border ${border} bg-gradient-to-br ${gradient} shadow-sm animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="w-10 h-10 rounded-xl bg-white border border-neutral-100 shadow-sm flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-neutral-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</div>
      <div className="text-3xl font-bold text-neutral-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <span className="text-neutral-600 text-sm font-medium flex items-center gap-1 justify-end"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    case "available":
      return <span className="text-emerald-600 text-sm font-medium flex items-center gap-1 justify-end"><CheckCircle2 className="w-3.5 h-3.5" /> Available</span>;
    case "paid":
      return <span className="text-neutral-500 text-sm font-medium flex items-center gap-1 justify-end"><Wallet className="w-3.5 h-3.5" /> Paid</span>;
    case "reversed":
    case "cancelled":
      return <span className="text-neutral-500 text-sm font-medium flex items-center gap-1 justify-end"><XCircle className="w-3.5 h-3.5" /> {status}</span>;
    default:
      return <span className="text-neutral-500 text-sm font-medium justify-end">{status}</span>;
  }
}
