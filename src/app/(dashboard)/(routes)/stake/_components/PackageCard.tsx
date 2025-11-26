"use client";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedRadialChart } from "@/components/ui/animated-radial-chart";
import { Award, ArrowUpRight, Camera, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { calculateDailyEarning, calculateMaxEarning } from "@/lib/staking-packages";
import type { StakingPackage } from "@/lib/staking-packages";

interface PackageCardProps {
  pkg: StakingPackage;
  walletBalance?: number;
  maxRoi?: number;
  maxCap?: number;
}

const PackageCard = ({
  pkg,
  walletBalance = 0,
  maxRoi = 1,
  maxCap = 1,
}: PackageCardProps) => {
  const [receiptData, setReceiptData] = useState<{
    id: string;
    packageName: string;
    amount: number;
    roi: number;
    cap: number;
    estimatedDaily: number;
    timestamp: string;
  } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const dailyEarning = calculateDailyEarning(pkg.amount, pkg.roi);
  const maxEarning = calculateMaxEarning(pkg.amount, pkg.cap);
  const hasInsufficientBalance = walletBalance < pkg.amount;
  const roiProgress = maxRoi > 0 ? Math.min((pkg.roi / maxRoi) * 100, 100) : 0;
  const capProgress = maxCap > 0 ? Math.min((pkg.cap / maxCap) * 100, 100) : 0;

  const utils = trpc.useUtils();
  const createStakeMutation = trpc.user.createStake.useMutation({
    onSuccess: () => {
      toast.success("Subscription created successfully!");
      utils.user.getStakingEntries.invalidate();
      utils.user.getWalletBalance.invalidate();
      setReceiptData({
        id: `SUB-${Date.now()}`,
        packageName: pkg.name,
        amount: pkg.amount,
        roi: pkg.roi,
        cap: pkg.cap,
        estimatedDaily: dailyEarning,
        timestamp: new Date().toISOString(),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create subscription");
    },
  });

  const handleSubscribe = () => {
    createStakeMutation.mutate({ amount: pkg.amount });
  };

  const formattedTimestamp = useMemo(() => {
    if (!receiptData) return "";
    return new Date(receiptData.timestamp).toLocaleString();
  }, [receiptData]);

  const handleShare = async () => {
    if (!receiptData) return;
    const shareText = `Subscribed to ${receiptData.packageName} for ${receiptData.amount.toLocaleString()} USDT. Daily ROI: ${receiptData.roi}% (≈ ${receiptData.estimatedDaily.toFixed(2)} USDT/day).`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "New Subscription",
          text: shareText,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Sharing cancelled.");
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Details copied to clipboard");
      } catch {
        toast.error("Unable to copy details");
      }
    } else {
      toast.error("Sharing not supported on this device");
    }
  };

  const handleScreenshot = async () => {
    const node = receiptRef.current;
    if (!node) return;
    try {
      // @ts-ignore - html2canvas is dynamically loaded at runtime
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(node, { backgroundColor: null });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${pkg.name.replace(/\s+/g, "-").toLowerCase()}-receipt.png`;
      link.click();
      toast.success("Receipt downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Unable to capture receipt screenshot");
    }
  };

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
    <>
      <Dialog open={!!receiptData} onOpenChange={(open) => !open && setReceiptData(null)}>
        <DialogContent className="max-w-sm sm:max-w-md">
          {receiptData && (
            <div
              ref={receiptRef}
              className="space-y-4 rounded-2xl bg-gradient-to-br from-white via-white to-emerald-25 p-4 text-sm text-gray-800 shadow-md dark:from-neutral-950 dark:via-neutral-950 dark:to-purple-950 dark:text-gray-100"
            >
              <DialogHeader className="text-left">
                <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Subscription Receipt
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                  {formattedTimestamp}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-emerald-200/60 bg-white/90 p-3 dark:border-purple-500/30 dark:bg-neutral-900/80">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-600 dark:text-purple-200">
                  Package
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {receiptData.packageName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receipt #{receiptData.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-emerald-200/60 bg-white/90 p-3 dark:border-purple-500/30 dark:bg-neutral-900/80">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-600 dark:text-purple-200">
                    Amount
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {receiptData.amount.toLocaleString()} USDT
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200/60 bg-white/90 p-3 dark:border-purple-500/30 dark:bg-neutral-900/80">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-600 dark:text-purple-200">
                    Daily ROI
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {receiptData.roi}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ≈ {receiptData.estimatedDaily.toFixed(2)} USDT / day
                  </p>
                </div>
                <div className="col-span-2 rounded-lg border border-emerald-200/60 bg-white/90 p-3 dark:border-purple-500/30 dark:bg-neutral-900/80">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-600 dark:text-purple-200">
                    Cap
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {(receiptData.cap * 100).toFixed(0)}% • up to {(receiptData.amount * receiptData.cap).toLocaleString()} USDT
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full border border-emerald-200 text-emerald-700 dark:border-purple-500/40 dark:text-purple-200"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full border border-emerald-200 text-emerald-700 dark:border-purple-500/40 dark:text-purple-200"
              onClick={handleScreenshot}
            >
              <Camera className="mr-2 h-4 w-4" /> Screenshot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card
      className={cn(
        "relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-emerald-400/20 bg-white/80 p-6 text-left shadow-sm transition-all duration-300 backdrop-blur dark:border-purple-500/25 dark:bg-neutral-950/70",
        "hover:shadow-[0_20px_60px_-45px_rgba(16,185,129,0.55)] dark:hover:shadow-[0_20px_60px_-45px_rgba(168,85,247,0.5)]"
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl dark:from-purple-500/20 dark:to-indigo-500/25" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/30 opacity-40 dark:border-white/10" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
              getPackageColor(pkg.id)
            )}
          >
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{pkg.name}</h3>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
              #{pkg.id.toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex w-full items-center justify-between gap-4 sm:grid sm:grid-cols-2 sm:items-start">
            <div className="flex w-1/2 flex-col items-center gap-2 sm:w-full sm:items-start">
              <AnimatedRadialChart
                value={roiProgress}
                size={140}
                strokeWidth={14}
                showLabels={false}
                displayValue={`${pkg.roi.toFixed(1)}%`}
                duration={1.2}
              />
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 sm:text-left">
                Daily ROI
                <p className="text-xs text-gray-500 dark:text-gray-400">≈ {dailyEarning.toFixed(2)} USDT / day</p>
              </div>
            </div>
            <div className="flex w-1/2 flex-col items-center gap-2 sm:w-full sm:items-start">
              <AnimatedRadialChart
                value={capProgress}
                size={140}
                strokeWidth={14}
                showLabels={false}
                displayValue={`${(pkg.cap * 100).toFixed(0)}%`}
                duration={1.2}
              />
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 sm:text-left">
                Max cap
                <p className="text-xs text-gray-500 dark:text-gray-400">Up to {maxEarning.toLocaleString()} USDT</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          {hasInsufficientBalance ? (
            <Link href="/wallet" className="block">
              <Button className="w-full rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold tracking-wide text-white shadow-lg transition-transform hover:scale-[1.01] dark:from-purple-500 dark:to-indigo-500">
                Deposit
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={createStakeMutation.isPending}
              className="w-full rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold tracking-wide text-white shadow-lg transition-transform hover:scale-[1.01] dark:from-purple-500 dark:to-indigo-500"
            >
              {createStakeMutation.isPending ? "Subscribing…" : "Activate subscription"}
            </Button>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            Subscription value: {pkg.amount.toLocaleString()} USDT
          </p>
        </div>
      </div>
    </Card>
  </>
  );
};

export default PackageCard;

