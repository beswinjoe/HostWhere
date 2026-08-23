"use client";

import Link from "next/link";
import {
  XCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";

export default function CancelledPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden flex flex-col">
      <Navbar />

      <div className="fixed inset-0 bg-grid z-0 pointer-events-none opacity-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/3 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-28">
        <div className="w-full max-w-lg mx-auto hero-animate">
          <div className="glass rounded-3xl p-10 sm:p-12 text-center relative overflow-hidden">
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

            <div className="relative z-10">
              {/* Error icon */}
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                Payment Not Completed
              </h1>

              <p className="text-neutral-400 mb-8 leading-relaxed">
                Your payment was cancelled or did not go through. No charges
                were made. You can try again at any time.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/featured" className="w-full sm:w-auto">
                  <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-bold transition-all">
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </button>
                </Link>

                <Link href="/analyze" className="w-full sm:w-auto">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-semibold text-white transition-all">
                    Analyze a Project
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
