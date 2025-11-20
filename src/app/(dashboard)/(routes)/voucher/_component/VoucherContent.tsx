"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useThemeClasses } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";
import { Ticket, CheckCircle2, AlertCircle } from "lucide-react";
import VoucherCard from "./VoucherCard";
import { trpc } from "@/trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";
import { useRouter } from "next/navigation";

type VoucherOutput = inferRouterOutputs<AppRouter>["user"]["getVouchers"][number];

const VoucherContent = () => {
  const router = useRouter();
  const { text } = useThemeClasses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const utils = trpc.useUtils();
  
  // Fetch only active package vouchers (for staking use)
  const { data: vouchers = [], isLoading } = trpc.user.getVouchers.useQuery({
    status: "active", // Only show active vouchers
    type: "package", // Only package type vouchers
  });

  // Mutation to use voucher for stake
  const useVoucherMutation = trpc.user.useVoucherForStake.useMutation({
    onSuccess: (data) => {
      setDialogType("success");
      setDialogMessage(data.message || "Stake entry created successfully!");
      setDialogOpen(true);
      // Invalidate queries to refresh data
      utils.user.getVouchers.invalidate();
      utils.user.getStakingEntries.invalidate();
      utils.user.getWalletBalance.invalidate();
    },
    onError: (error) => {
      setDialogType("error");
      setDialogMessage(error.message || "Failed to use voucher");
      setDialogOpen(true);
    },
  });

  // Filter out expired vouchers
  const activeVouchers = vouchers.filter((voucher) => {
    if (voucher.status === "active" && voucher.expiresAt) {
      return new Date(voucher.expiresAt) > new Date();
    }
    return voucher.status === "active";
  });

  const handleUseNow = (voucherId: string) => {
    useVoucherMutation.mutate({ voucherId });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // If success, navigate to stake page
    if (dialogType === "success") {
      router.push("/stake");
    }
  };

  return (
    <div className=" md:p-6">
      <Card
        className={cn(
          " rounded-xl border-none bg-white/80 shadow-sm backdrop-blur dark:border-purple-500/25 dark:bg-neutral-950/70",
          "hover:shadow-[0_20px_60px_-45px_rgba(16,185,129,0.55)] dark:hover:shadow-[0_20px_60px_-45px_rgba(168,85,247,0.5)]"
        )}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 blur-3xl dark:from-purple-500/20 dark:to-indigo-500/25" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/30 opacity-40 dark:border-white/10" />

        <CardHeader className="relative z-10">
          <CardTitle className={cn("text-2xl items-center font-semibold", text.primary)}>
            My Voucher
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mb-4" />
              <p className={cn("text-sm", text.muted)}>Loading vouchers...</p>
            </div>
          ) : activeVouchers && activeVouchers.length > 0 ? (
            <div className="space-y-4">
              {activeVouchers.map((voucher: VoucherOutput) => {
                // Format value with currency
                const formattedValue = `$${voucher.value.toFixed(2)}`;
                
                // Format used date if available
                const usedOn = voucher.usedAt
                  ? new Date(voucher.usedAt).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                    }) +
                    " at " +
                    new Date(voucher.usedAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : undefined;

                // Determine badge color based on type if not specified
                const badgeColor =
                  voucher.badgeColor ||
                  (voucher.type === "package"
                    ? "purple"
                    : voucher.type === "withdraw"
                    ? "green"
                    : voucher.type === "futures"
                    ? "orange"
                    : "blue");

                return (
                  <VoucherCard
                    key={voucher.id}
                    voucherId={voucher.id}
                    badge={voucher.badge || `${voucher.type.charAt(0).toUpperCase() + voucher.type.slice(1)} Voucher`}
                    badgeColor={badgeColor as "orange" | "blue" | "green" | "purple"}
                    value={formattedValue}
                    title={voucher.title}
                    description={voucher.description || ""}
                    linkText={voucher.linkText ?? undefined}
                    linkHref={voucher.linkHref ?? undefined}
                    roiValidityDays={(voucher as any).roiValidityDays ?? undefined}
                    usedOn={usedOn}
                    showUseButton={true}
                    isUsing={useVoucherMutation.isPending && useVoucherMutation.variables?.voucherId === voucher.id}
                    onClick={() => {
                      // Handle voucher click - optional, can navigate or show details
                    }}
                    onUseNow={() => {
                      // Use voucher to create stake entry
                      handleUseNow(voucher.id);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ticket className={cn("h-12 w-12 mb-4", text.muted)} />
              <p className={cn("text-lg font-medium", text.primary)}>
                No available voucher
              </p>
              <p className={cn("text-sm mt-2", text.muted)}>
                You don't have any active package vouchers at the moment
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success/Error Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {dialogType === "success" ? (
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-500" />
              )}
              <DialogTitle>
                {dialogType === "success" ? "Success" : "Error"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription className="pt-2">
            {dialogMessage}
          </DialogDescription>
          <DialogFooter>
            <Button
              onClick={handleDialogClose}
              className={cn(
                "w-full",
                dialogType === "success"
                  ? "bg-green-400 dark:bg-purple-500 hover:bg-green-500 dark:hover:bg-purple-600 text-white"
                  : "bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white"
              )}
            >
              {dialogType === "success" ? "View Stake" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoucherContent;

