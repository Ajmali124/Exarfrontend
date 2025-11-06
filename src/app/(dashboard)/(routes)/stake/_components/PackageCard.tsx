"use client";

import { useThemeClasses } from "@/lib/theme-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { calculateDailyEarning, calculateMaxEarning } from "@/lib/staking-packages";
import type { StakingPackage } from "@/lib/staking-packages";

interface PackageCardProps {
  pkg: StakingPackage;
  isSelected: boolean;
  onSelect: () => void;
  walletBalance?: number;
}

const PackageCard = ({ pkg, isSelected, onSelect, walletBalance = 0 }: PackageCardProps) => {
  const { text, bg, border } = useThemeClasses();

  const utils = trpc.useUtils();
  const createStakeMutation = trpc.user.createStake.useMutation({
    onSuccess: () => {
      toast.success("Subscription created successfully!");
      utils.user.getStakingEntries.invalidate();
      utils.user.getWalletBalance.invalidate();
      onSelect(); // Reset selection
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create subscription");
    },
  });

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    createStakeMutation.mutate({ amount: pkg.amount });
  };

  const dailyEarning = calculateDailyEarning(pkg.amount, pkg.roi);
  const maxEarning = calculateMaxEarning(pkg.amount, pkg.cap);
  const hasInsufficientBalance = walletBalance < pkg.amount;

  const getPackageColor = (id: number) => {
    const colors = [
      "from-amber-500 to-amber-600",      // Trial Node (id: 0)
      "from-orange-500 to-orange-600",    // Bronze Node (id: 1)
      "from-gray-400 to-gray-500",        // Silver Node (id: 2)
      "from-yellow-500 to-yellow-600",   // Gold Node (id: 3)
      "from-blue-500 to-blue-600",        // Platinum Node (id: 4)
      "from-cyan-500 to-cyan-600",        // Diamond Node (id: 5)
      "from-purple-500 to-purple-600",    // Titan Node (id: 6)
      "from-pink-500 to-pink-600",        // Crown Node (id: 7)
      "from-indigo-500 to-indigo-600",    // Elysium Vault (id: 8)
    ];
    return colors[id] || colors[0];
  };

  return (
    <Card
      className={cn(
        bg.card,
        border.primary,
        "border p-4 transition-all",
        isSelected
          ? "ring-2 ring-green-500 dark:ring-purple-500 shadow-lg"
          : "hover:shadow-md"
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-lg bg-gradient-to-r",
                getPackageColor(pkg.id),
                "text-white"
              )}
            >
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className={`font-semibold ${text.primary}`}>{pkg.name}</h3>
              <p className={`text-xs ${text.muted}`}>
                ID: {pkg.id}
              </p>
            </div>
          </div>
          {isSelected && (
            <Badge
              className={cn(
                "bg-green-500 dark:bg-purple-500 text-white"
              )}
            >
              Selected
            </Badge>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <p className={`text-xs ${text.muted}`}>Deposit Amount</p>
          <p className={`text-sm font-medium ${text.primary}`}>
            {pkg.amount.toLocaleString()} USDT
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${text.muted}`} />
            <div>
              <p className={`text-xs ${text.muted}`}>Daily ROI</p>
              <p className={`text-sm font-semibold ${text.primary}`}>
                {pkg.roi}%
              </p>
              <p className={`text-xs ${text.secondary}`}>
                ≈ {dailyEarning.toFixed(2)}/day
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${text.muted}`} />
            <div>
              <p className={`text-xs ${text.muted}`}>Max Cap</p>
              <p className={`text-sm font-semibold ${text.primary}`}>
                {(pkg.cap * 100).toFixed(0)}%
              </p>
              <p className={`text-xs ${text.secondary}`}>
                {maxEarning.toLocaleString()} USDT
              </p>
            </div>
          </div>
        </div>

        {/* Subscribe Button */}
        <div className="pt-3 border-t border-gray-200 dark:border-neutral-700">
          <Button
            onClick={handleSubscribe}
            disabled={createStakeMutation.isPending || hasInsufficientBalance}
            className={cn(
              "w-full",
              "bg-gradient-to-r from-green-500 to-teal-500",
              "dark:from-purple-500 dark:to-purple-600",
              "text-white hover:from-green-600 hover:to-teal-600",
              "dark:hover:from-purple-600 dark:hover:to-purple-700",
              hasInsufficientBalance && "opacity-50 cursor-not-allowed"
            )}
          >
            {createStakeMutation.isPending ? (
              "Subscribing..."
            ) : hasInsufficientBalance ? (
              "Insufficient Balance"
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Subscribe Now
              </>
            )}
          </Button>
          {hasInsufficientBalance && (
            <p className={`text-xs ${text.muted} text-center mt-1`}>
              Need {pkg.amount.toLocaleString()} USDT
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PackageCard;

