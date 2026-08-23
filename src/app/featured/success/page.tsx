"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Trophy,
  ArrowRight,
  Loader2,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";

function SuccessContent() {
  const searchParams = useSearchParams();

  return (
    <div className="w-full max-w-lg mx-auto hero-animate">
      <div className="glass rounded-3xl p-10 sm:p-12 text-center relative overflow-hidden">
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-50" />

        <div className="relative z-10">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Project Featured! 🎉
          </h1>

          <p className="text-neutral-400 mb-8 leading-relaxed">
            Your payment was successful and your project is now live on the
            Featured Projects leaderboard. It may take a few moments for the
            leaderboard to update.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/featured" className="w-full sm:w-auto">
              <button className="cta-glow w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-bold transition-all">
                <Trophy className="w-5 h-5" />
                View Leaderboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/analyze" className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-semibold text-white transition-all">
                <Star className="w-4 h-4" />
                Analyze Another
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden flex flex-col">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-28">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
