"use client";

import { useState, useEffect } from "react";
import { useThemeClasses } from "@/lib/theme-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { findPackageForAmount, calculateDailyEarning, calculateMaxEarning } from "@/lib/staking-packages";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StakingPackage } from "@/lib/staking-packages";

interface StakingFormProps {
  packages: StakingPackage[];
  selectedPackageId: number | null;
  onPackageSelect: (id: number | null) => void;
}

const StakingForm = ({
  packages,
  selectedPackageId,
  onPackageSelect,
}: StakingFormProps) => {
  const { text, bg, border } = useThemeClasses();
  const [amount, setAmount] = useState<string>("");
  const [detectedPackage, setDetectedPackage] = useState<StakingPackage | null>(
    null
  );

  const utils = trpc.useUtils();
  const createStakeMutation = trpc.user.createStake.useMutation({
    onSuccess: () => {
      toast.success("Subscription created successfully!");
      setAmount("");
      setDetectedPackage(null);
      utils.user.getStakingEntries.invalidate();
      utils.user.getWalletBalance.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create subscription");
    },
  });

  // Detect package when amount changes
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      const pkg = findPackageForAmount(numAmount);
      setDetectedPackage(pkg);
      if (pkg) {
        onPackageSelect(pkg.id);
      }
    } else {
      setDetectedPackage(null);
      onPackageSelect(null);
    }
  }, [amount, onPackageSelect]);

  // Pre-fill amount when package is selected
  useEffect(() => {
    if (selectedPackageId !== null) {
      const pkg = packages.find((p) => p.id === selectedPackageId);
      if (pkg) {
        setAmount(pkg.amount.toString());
      }
    }
  }, [selectedPackageId, packages]);

  const handleStake = () => {
    const numAmount = parseFloat(amount);

    // Validation edge cases
    if (!amount || isNaN(numAmount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (numAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (!detectedPackage) {
      toast.error("Please select a valid subscription package.");
      return;
    }

    // Validate exact amount match
    if (numAmount !== detectedPackage.amount) {
      toast.error(
        `Amount must be exactly ${detectedPackage.amount.toLocaleString()} USDT for ${detectedPackage.name}`
      );
      return;
    }

    // Check for decimal amounts (should be whole numbers only for fixed packages)
    if (numAmount % 1 !== 0) {
      toast.error("Package amounts must be whole numbers (no decimals)");
      return;
    }

    createStakeMutation.mutate({ amount: numAmount });
  };

  // Safe calculations with validation
  const numAmount = parseFloat(amount) || 0;
  const dailyEarning =
    detectedPackage && numAmount > 0
      ? calculateDailyEarning(numAmount, detectedPackage.roi)
      : 0;
  const maxEarning =
    detectedPackage && numAmount > 0
      ? calculateMaxEarning(numAmount, detectedPackage.cap)
      : 0;

  return (
    <Card
      className={cn(
        bg.card,
        border.primary,
        "border p-6 space-y-4"
      )}
    >
      <div className="space-y-4">
        <div>
          <h3 className={`text-lg font-semibold ${text.primary} mb-2`}>
            Enter Subscription Amount
          </h3>
          <div className="flex gap-2">
              <Input
              type="number"
              placeholder="Enter package amount (e.g., 100, 250, 500)"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty or whole numbers only
                if (value === "" || /^\d+$/.test(value)) {
                  setAmount(value);
                }
              }}
              onBlur={() => {
                // Validate and format on blur
                const num = parseFloat(amount);
                if (num && num > 0 && num % 1 === 0) {
                  setAmount(num.toString());
                }
              }}
              min={10}
              step={1}
              max={999999}
              className={cn(
                "flex-1",
                bg.secondary,
                border.primary,
                text.primary,
                "border"
              )}
            />
            <Button
              onClick={handleStake}
              disabled={!detectedPackage || createStakeMutation.isPending}
              className={cn(
                "bg-gradient-to-r from-green-500 to-teal-500",
                "dark:from-purple-500 dark:to-purple-600",
                "text-white hover:from-green-600 hover:to-teal-600",
                "dark:hover:from-purple-600 dark:hover:to-purple-700"
              )}
            >
              {createStakeMutation.isPending ? (
                "Subscribing..."
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Subscribe Now
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Detected Package Info */}
        {detectedPackage && amount && parseFloat(amount) === detectedPackage.amount && (
          <div
            className={cn(
              "p-4 rounded-lg border",
              "bg-green-50/50 dark:bg-purple-500/10",
              "border-green-200 dark:border-purple-500/30"
            )}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-purple-400 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div>
                  <p className={`font-semibold ${text.primary}`}>
                    {detectedPackage.name}
                  </p>
                  <p className={`text-sm ${text.secondary}`}>
                    Deposit: {detectedPackage.amount.toLocaleString()} USDT
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className={`text-xs ${text.muted} mb-1`}>
                      Daily ROI
                    </p>
                    <p className={`text-sm font-semibold ${text.primary}`}>
                      {detectedPackage.roi}% / day
                    </p>
                    <p className={`text-xs ${text.secondary}`}>
                      ≈ {dailyEarning.toFixed(2)} USDT/day
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${text.muted} mb-1`}>Max Earning</p>
                    <p className={`text-sm font-semibold ${text.primary}`}>
                      {detectedPackage.cap}x ({maxEarning.toFixed(2)} USDT)
                    </p>
                    <p className={`text-xs ${text.secondary}`}>
                      Cap: {(detectedPackage.cap * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {amount &&
          parseFloat(amount) > 0 &&
          !detectedPackage && (
            <div
              className={cn(
                "p-3 rounded-lg border",
                "bg-red-50/50 dark:bg-red-500/10",
                "border-red-200 dark:border-red-500/30"
              )}
            >
              <p className={`text-sm text-red-600 dark:text-red-400`}>
                Invalid amount. Please enter one of the available package amounts: 10, 100, 250, 500, 1,000, 2,500, 5,000, 10,000, or 25,000 USDT
              </p>
            </div>
          )}
      </div>
    </Card>
  );
};

export default StakingForm;

