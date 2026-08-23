"use client";

import { useState } from "react";
import { formatCentsToUSD } from "@/lib/featured/types";
import { Loader2, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function RequestPayoutModal({ availableCents }: { availableCents: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const [amount, setAmount] = useState((availableCents / 100).toFixed(2));
  const [method, setMethod] = useState("paypal");
  const [details, setDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const amountCents = Math.round(parseFloat(amount) * 100);
    
    if (amountCents < 5000) {
      setError("Minimum payout request is $50.00");
      return;
    }
    
    if (amountCents > availableCents) {
      setError("Amount exceeds available balance");
      return;
    }

    if (!details.trim()) {
      setError("Please provide payout details (email or wallet address)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/affiliate/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          payoutMethod: method,
          payoutDetails: details
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        setError(data.error || "Failed to submit request");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        disabled={availableCents < 5000}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        Request Payout
        <ArrowRight className="w-4 h-4 opacity-70" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-neutral-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Request Payout</h3>
            <p className="text-neutral-500 mb-6">Available Balance: {formatCentsToUSD(availableCents)}</p>

            {error && (
              <div className="p-3 mb-6 text-sm font-medium text-red-800 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-neutral-500 font-medium">$</span>
                  <input
                    type="number"
                    min="50"
                    step="0.01"
                    max={(availableCents / 100).toFixed(2)}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Minimum payout is $50.00</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Payout Method</label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="paypal">PayPal</option>
                  <option value="crypto">Cryptocurrency (USDC)</option>
                  <option value="wire">Wire Transfer ({">"}$500 only)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Payout Details</label>
                <input
                  type="text"
                  placeholder={method === 'paypal' ? "PayPal Email Address" : "Wallet Address or Account details"}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
