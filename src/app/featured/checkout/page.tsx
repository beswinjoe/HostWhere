"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Star,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { PlanSelector } from "@/components/featured/PlanSelector";
import { formatCentsToUSD, type PlanType, FEATURED_PLANS } from "@/lib/featured/types";

function CheckoutContent() {
  const searchParams = useSearchParams();

  const repo = searchParams.get("repo") || "";
  const name = searchParams.get("name") || "";
  const framework = searchParams.get("framework") || "unknown";
  const host = searchParams.get("host") || "unknown";
  const resultId = searchParams.get("resultId") || "";
  const isExisting = searchParams.get("existing") === "true";

  const [selectedPlan, setSelectedPlan] = useState<PlanType>("featured");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    if (!selectedPlan) {
      setError("Please select a plan.");
      return;
    }

    if (!repo) {
      setError("Missing repository URL. Please analyze a project first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/featured/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository_url: repo,
          project_name: name || repo.split("/").pop() || "Unnamed Project",
          description: "",
          framework,
          recommended_host: host,
          plan: selectedPlan,
          analysis_result_id: resultId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create checkout session.");
        setLoading(false);
        return;
      }

      // Redirect to Dodo Payments checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setError("No checkout URL received. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }, [selectedPlan, repo, name, framework, host, resultId]);

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="glass p-10 rounded-3xl text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Missing project info</h2>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            Please analyze a GitHub repository first, then use the
            &quot;Feature This Project&quot; button.
          </p>
          <Link href="/analyze">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-full font-semibold transition-all">
              Analyze a Project
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto hero-animate">
      {/* Back link */}
      <Link
        href="/featured"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to leaderboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-4">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-medium tracking-wide uppercase text-amber-300">
            {isExisting ? "Increase Your Bid" : "Feature This Project"}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          {isExisting ? "Extend or Upgrade" : "Feature This Project"}
        </h1>
        <p className="text-neutral-400">
          {isExisting
            ? "Extend your current plan or upgrade to a higher tier for more visibility."
            : "Promote your analyzed project on the Featured Projects leaderboard."}
        </p>
      </div>

      {/* Project Info Card */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate">{name || "Project"}</h3>
            <p className="text-xs text-neutral-500 font-mono truncate mt-0.5">
              {repo.replace("https://github.com/", "")}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {framework && framework !== "unknown" && (
                <span className="px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary/80 border border-primary/20">
                  {framework}
                </span>
              )}
              {host && host !== "unknown" && (
                <span className="px-2 py-0.5 text-xs rounded-md bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20">
                  {host}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Selector */}
      <div className="mb-8">
        <PlanSelector 
          value={selectedPlan} 
          onChange={setSelectedPlan} 
          isUpgrade={isExisting} // Optional: we can disable lower tiers if needed
        />
        {error && (
          <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
        )}
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading || !selectedPlan}
        className="cta-glow w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:pointer-events-none rounded-full font-bold text-lg transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating checkout...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Continue to Payment — {formatCentsToUSD(FEATURED_PLANS[selectedPlan]?.priceCents || 0)}
          </>
        )}
      </button>

      {/* Info text */}
      <p className="text-xs text-neutral-500 text-center mt-4 leading-relaxed">
        You&apos;ll be redirected to Dodo Payments to complete your transaction
        securely. Your project will appear on the leaderboard after payment
        confirmation.
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden flex flex-col">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-28">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>
    </div>
  );
}
