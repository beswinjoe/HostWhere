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
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      color: "from-blue-50 to-transparent",
      borderColor: "border-neutral-200",
      activeBorder: "border-blue-500",
      badge: undefined as string | undefined,
      disabled: isUpgrade, // Cannot downgrade to boost if already featured
    },
    {
      ...FEATURED_PLANS.featured,
      icon: <Star className="w-6 h-6 text-amber-500" />,
      color: "from-amber-50 to-transparent",
      borderColor: "border-neutral-200",
      activeBorder: "border-amber-500",
      badge: "Most Popular",
      disabled: false,
    },
    {
      ...FEATURED_PLANS.spotlight,
      icon: <Crown className="w-6 h-6 text-purple-600" />,
      color: "from-purple-50 to-transparent",
      borderColor: "border-neutral-200",
      activeBorder: "border-purple-600",
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
                ? `bg-gradient-to-b ${plan.color} ${plan.activeBorder} shadow-md scale-[1.02]`
                : isDisabled 
                  ? "bg-neutral-50 border-neutral-100 opacity-50 cursor-not-allowed"
                  : `bg-white ${plan.borderColor} hover:bg-neutral-50 hover:border-neutral-300 shadow-sm`
            }`}
          >
            {plan.badge && (
              <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isSelected ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 border border-neutral-200"
              }`}>
                {plan.badge}
              </span>
            )}
            
            <div className="mb-4">{plan.icon}</div>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-1">{plan.name}</h3>
            
            <div className="flex items-baseline gap-1 mb-4 text-neutral-900">
              <span className="text-2xl font-bold">{formatCentsToUSD(plan.priceCents)}</span>
              <span className="text-xs text-neutral-500 uppercase font-semibold">/ {plan.durationDays} Days</span>
            </div>
            
            <p className="text-sm text-neutral-600 mb-6 flex-grow leading-relaxed">
              {plan.description}
            </p>
            
            <div className={`mt-auto flex items-center gap-2 text-sm font-medium ${
              isSelected ? "text-neutral-900" : "text-neutral-500"
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                isSelected ? "bg-neutral-900 border-neutral-900 text-white" : "border-neutral-300 bg-white"
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
