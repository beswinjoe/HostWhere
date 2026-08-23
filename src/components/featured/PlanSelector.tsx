"use client";

import { FEATURED_PLANS, type PlanType } from "@/lib/featured/types";
import { formatCentsToUSD } from "@/lib/featured/types";
import { Check, Star, Zap, Crown } from "lucide-react";

interface PlanSelectorProps {
  value: PlanType;
  onChange: (plan: PlanType) => void;
  isUpgrade?: boolean;
}

export function PlanSelector({ value, onChange, isUpgrade }: PlanSelectorProps) {
  const plans = [
    {
      ...FEATURED_PLANS.boost,
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/20",
      activeBorder: "border-emerald-500",
      badge: undefined as string | undefined,
      disabled: isUpgrade, // Cannot downgrade to boost if already featured
    },
    {
      ...FEATURED_PLANS.featured,
      icon: <Star className="w-6 h-6 text-amber-400" />,
      color: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/20",
      activeBorder: "border-amber-500",
      badge: "Most Popular",
      disabled: false,
    },
    {
      ...FEATURED_PLANS.spotlight,
      icon: <Crown className="w-6 h-6 text-cyan-400" />,
      color: "from-cyan-500/20 to-cyan-500/5",
      borderColor: "border-cyan-500/20",
      activeBorder: "border-cyan-500",
      badge: "Premium",
      disabled: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan) => {
        const isSelected = value === plan.id;
        const isDisabled = plan.disabled;

        return (
          <button
            key={plan.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(plan.id)}
            className={`relative flex flex-col text-left p-6 rounded-2xl border transition-all duration-300 ${
              isSelected
                ? `bg-gradient-to-b ${plan.color} ${plan.activeBorder} shadow-lg scale-[1.02]`
                : isDisabled 
                  ? "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
                  : `glass ${plan.borderColor} hover:bg-white/10 hover:border-white/20`
            }`}
          >
            {plan.badge && (
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isSelected ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 border border-white/10"
              }`}>
                {plan.badge}
              </span>
            )}
            
            <div className="mb-4">{plan.icon}</div>
            
            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-bold">{formatCentsToUSD(plan.priceCents)}</span>
              <span className="text-xs text-neutral-400 uppercase font-semibold">/ {plan.durationDays} Days</span>
            </div>
            
            <p className="text-sm text-neutral-400 mb-6 flex-grow leading-relaxed">
              {plan.description}
            </p>
            
            <div className={`mt-auto flex items-center gap-2 text-sm font-medium ${
              isSelected ? "text-white" : "text-neutral-500"
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                isSelected ? "bg-white border-white text-black" : "border-neutral-600"
              }`}>
                {isSelected && <Check className="w-3 h-3" />}
              </div>
              {isSelected ? "Selected" : isDisabled ? "Unavailable" : "Select Plan"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
