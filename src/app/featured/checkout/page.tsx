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
        <div className="bg-white border border-neutral-200 shadow-sm p-10 rounded-3xl text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center mx-auto mb-6 border border-neutral-200">
            <AlertCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">Missing project info</h2>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Please analyze a GitHub repository first, then use the
            &quot;Feature This Project&quot; button.
          </p>
          <Link href="/analyze">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-full font-semibold transition-all shadow-sm">
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
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to leaderboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 bg-neutral-50 mb-4">
          <Star className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[11px] font-medium tracking-wide uppercase text-neutral-700">
            {isExisting ? "Increase Your Bid" : "Feature This Project"}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
          {isExisting ? "Extend or Upgrade" : "Feature This Project"}
        </h1>
        <p className="text-neutral-600">
          {isExisting
            ? "Extend your current plan or upgrade to a higher tier for more visibility."
            : "Promote your analyzed project on the Featured Projects leaderboard."}
        </p>
      </div>

      {/* Project Info Card */}
      <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-neutral-900 truncate">{name || "Project"}</h3>
            <p className="text-xs text-neutral-500 font-mono truncate mt-0.5">
              {repo.replace("https://github.com/", "")}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {framework && framework !== "unknown" && (
                <span className="px-2 py-0.5 text-xs rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {framework}
                </span>
              )}
              {host && host !== "unknown" && (
                <span className="px-2 py-0.5 text-xs rounded-md bg-neutral-50 text-neutral-600 border border-neutral-200">
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
          <p className="text-neutral-600 text-sm mt-4 text-center">{error}</p>
        )}
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading || !selectedPlan}
        className="cta-glow w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:pointer-events-none rounded-full font-bold text-lg transition-all"
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-blue-100 relative overflow-hidden flex flex-col">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-100" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-28">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>
    </div>
  );
}
