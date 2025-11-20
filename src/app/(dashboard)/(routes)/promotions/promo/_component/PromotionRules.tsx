"use client";

import { useThemeClasses } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Package,
  Users,
  AlertCircle,
  Award,
} from "lucide-react";

const PromotionRules = () => {
  const { text, bg } = useThemeClasses();

  const packageRewards = [
    { package: "Trial Node", roiDays: "14 days", highlight: false },
    { package: "Bronze Node", roiDays: "30 days", highlight: false },
    { package: "Silver Node", roiDays: "30 days", highlight: true },
    { package: "Gold Node", roiDays: "30 days", highlight: false },
    { package: "Platinum Node", roiDays: "30 days", highlight: false },
  ];

  const teamRewards = [
    {
      milestone: "3 Members Activated",
      description: "When 3 invited members activate ANY package",
      type: "Stakable voucher",
    },
    {
      milestone: "5 Trial Node Activations",
      description: "When 5 invited members activate Trial Node",
      type: "Withdrawable voucher",
    },
    {
      milestone: "10 Members Activated",
      description: "When 10 invited members activate ANY package",
      type: "Withdrawable + Stakable vouchers",
    },
    {
      milestone: "10 Members + 5 Silver Node",
      description: "When 10 members activated AND 5+ activated Silver Node or higher",
      type: "Premium rewards",
      highlight: true,
    },
  ];


  return (
    <Card className={cn("p-4 md:p-6 space-y-4 md:space-y-6", bg.card)}>
      <div>
        <h2 className={cn("text-xl md:text-2xl font-bold", text.primary)}>Promotion Rules & Rewards</h2>
        <p className={cn("text-xs md:text-sm mt-1", text.secondary)}>
          Understand how the pre-launch promotion works
        </p>
      </div>

      {/* Package Purchase Rewards */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center gap-2">
          <Package className={cn("h-4 w-4 md:h-5 md:w-5", "text-green-500 dark:text-purple-400")} />
          <h3 className={cn("text-base md:text-lg font-semibold", text.primary)}>Package Purchase Rewards</h3>
        </div>
        <div className="space-y-2">
          {packageRewards.map((reward, index) => (
            <div
              key={index}
              className={cn(
                "p-3 md:p-4 rounded-lg border",
                "bg-white dark:bg-neutral-900/50",
                "border-gray-200 dark:border-neutral-800",
                reward.highlight && "border-purple-300 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-900/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {reward.highlight && <Award className="h-4 w-4 text-purple-500 flex-shrink-0" />}
                  <span className={cn("text-sm md:text-base font-medium", reward.highlight && "text-purple-600 dark:text-purple-400")}>
                    {reward.package}
                  </span>
                </div>
                <span className={cn("text-xs md:text-sm", text.secondary)}>
                  {reward.roiDays} ROI
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className={cn("text-xs italic", text.muted)}>
          * Higher tier packages also receive rewards
        </p>
      </div>

      {/* Team Building Rewards */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center gap-2">
          <Users className={cn("h-4 w-4 md:h-5 md:w-5", "text-blue-500 dark:text-blue-400")} />
          <h3 className={cn("text-base md:text-lg font-semibold", text.primary)}>Team Building Rewards</h3>
        </div>
        <div className="space-y-2 md:space-y-3">
          {teamRewards.map((reward, index) => (
            <div
              key={index}
              className={cn(
                "p-3 md:p-4 rounded-lg border",
                "bg-white dark:bg-neutral-900/50",
                "border-gray-200 dark:border-neutral-800",
                reward.highlight && "border-purple-300 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-900/30"
              )}
            >
              <div className="flex items-start gap-2 md:gap-3">
                {reward.highlight && <Award className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <h4 className={cn("text-sm md:text-base font-semibold mb-1", text.primary, reward.highlight && "text-purple-600 dark:text-purple-400")}>
                    {reward.milestone}
                  </h4>
                  <p className={cn("text-xs md:text-sm mb-2", text.secondary)}>{reward.description}</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={cn("h-3 w-3 md:h-4 md:w-4 flex-shrink-0", "text-green-500 dark:text-green-400")} />
                    <span className={cn("text-xs md:text-sm", "text-green-600 dark:text-green-400")}>
                      {reward.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={cn("p-3 md:p-4 rounded-lg", "bg-amber-50 dark:bg-amber-900/20", "border border-amber-200 dark:border-amber-800")}>
          <div className="flex items-start gap-2 md:gap-3">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={cn("font-semibold text-xs md:text-sm mb-1", "text-amber-900 dark:text-amber-200")}>
                Important Reminder
              </h4>
              <p className={cn("text-xs md:text-sm", "text-amber-800 dark:text-amber-300")}>
                Team rewards are ONLY granted when invited members ACTIVATE packages. Just inviting members does NOT grant rewards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-3 md:space-y-4">
        <h3 className={cn("text-base md:text-lg font-semibold", text.primary)}>How It Works</h3>
        <div className="space-y-3">
          <div className="flex gap-3 md:gap-4">
            <div className={cn("flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base", "bg-green-500 dark:bg-purple-500 text-white")}>
              1
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={cn("text-sm md:text-base font-semibold mb-1", text.primary)}>Register for Promotion</h4>
              <p className={cn("text-xs md:text-sm", text.secondary)}>
                Click "Register Now" to join the 14-day pre-launch promotion
              </p>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4">
            <div className={cn("flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base", "bg-green-500 dark:bg-purple-500 text-white")}>
              2
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={cn("text-sm md:text-base font-semibold mb-1", text.primary)}>Buy Packages</h4>
              <p className={cn("text-xs md:text-sm", text.secondary)}>
                Purchase any staking package to automatically receive a reward voucher
              </p>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4">
            <div className={cn("flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base", "bg-green-500 dark:bg-purple-500 text-white")}>
              3
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={cn("text-sm md:text-base font-semibold mb-1", text.primary)}>Invite & Build Team</h4>
              <p className={cn("text-xs md:text-sm", text.secondary)}>
                Invite friends and earn rewards when they activate packages. Focus on Silver Node for premium rewards!
              </p>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4">
            <div className={cn("flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-sm md:text-base", "bg-green-500 dark:bg-purple-500 text-white")}>
              4
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={cn("text-sm md:text-base font-semibold mb-1", text.primary)}>Use Your Vouchers</h4>
              <p className={cn("text-xs md:text-sm", text.secondary)}>
                Go to the voucher page and click "Use Now" to activate your rewards. Vouchers expire in 14 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PromotionRules;

