"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useThemeClasses } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { QrCode, X, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";

const AddCodeContent = () => {
  const router = useRouter();
  const { text } = useThemeClasses();
  const [code, setCode] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const utils = trpc.useUtils();

  // Get redemption history (used vouchers)
  const { data: redeemedVouchers = [], isLoading: isLoadingHistory } =
    trpc.user.getVouchers.useQuery({
      status: "used",
    });

  // Redeem voucher mutation
  const redeemMutation = trpc.user.redeemVoucherByCode.useMutation({
    onSuccess: (data) => {
      setDialogType("success");
      setDialogMessage(data.message || "Voucher redeemed successfully!");
      setDialogOpen(true);
      setCode("");
      // Refresh vouchers list
      utils.user.getVouchers.invalidate();
    },
    onError: (error) => {
      setDialogType("error");
      setDialogMessage(error.message || "Failed to redeem voucher");
      setDialogOpen(true);
    },
  });

  const handleRedeem = () => {
    if (!code.trim()) {
      setDialogType("error");
      setDialogMessage("Please enter a voucher code");
      setDialogOpen(true);
      return;
    }

    redeemMutation.mutate({
      code: code.trim(),
    });
  };

  const handleClear = () => {
    setCode("");
  };

  const handleRefresh = () => {
    utils.user.getVouchers.invalidate();
  };

  const handleScan = () => {
    // TODO: Implement QR code scanning functionality
    setDialogType("error");
    setDialogMessage("QR code scanning coming soon");
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // If success, navigate back after dialog closes
    if (dialogType === "success") {
      router.push("/voucher");
    }
  };

  const isRedeemDisabled = !code.trim() || redeemMutation.isPending;

  return (
    <>
      <div className="px-2 md:px-4 space-y-6">
        {/* Main Heading */}
        <h2 className={cn("text-xl font-bold px-2 mt-4", text.primary)}>Add Code</h2>

        {/* Code Input Section */}
        <div className="space-y-4">
          {/* Input Field */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Add Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRedeemDisabled) {
                  handleRedeem();
                }
              }}
              className={cn(
                "w-full h-12 text-base text-center",
                "border-gray-200 dark:border-neutral-800",
                "bg-white dark:bg-neutral-900",
                "focus:border-green-400 dark:focus:border-purple-400"
              )}
              maxLength={50}
            />
            {code && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Redeem Button */}
          <Button
            onClick={handleRedeem}
            disabled={isRedeemDisabled}
            className={cn(
              "w-full h-12 text-sm font-medium",
              isRedeemDisabled
                ? "bg-gray-300 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400 cursor-not-allowed"
                : "bg-green-400 dark:bg-purple-500 hover:bg-green-500 dark:hover:bg-purple-600 text-white"
            )}
          >
            {redeemMutation.isPending ? "Redeeming..." : "Redeem Voucher"}
          </Button>
        </div>

        {/* Redemption History Section */}
        <div className="space-y-4 px-2">
          <div className="flex items-center justify-between">
            <h3 className={cn("text-base font-semibold", text.primary)}>
              Redemption History
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <a
                href="#"
                className={cn(
                  "text-xs font-medium text-green-400 dark:text-purple-400 hover:text-green-500 dark:hover:text-purple-400 transition-colors"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement contact support
                  setDialogType("error");
                  setDialogMessage("Contact support feature coming soon");
                  setDialogOpen(true);
                }}
              >
                Contact Support
              </a>
            </div>
          </div>

        {/* Redemption History List */}
        {isLoadingHistory ? (
          <Card
            className={cn(
              "rounded-xl border-none bg-white/80 shadow-sm backdrop-blur dark:border-purple-500/25 dark:bg-neutral-950/70"
            )}
          >
            <CardContent className="p-6 text-center">
              <div className="h-6 w-6 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-2" />
              <p className={cn("text-xs", text.muted)}>Loading history...</p>
            </CardContent>
          </Card>
        ) : redeemedVouchers && redeemedVouchers.length > 0 ? (
          <div className="space-y-3">
            {redeemedVouchers.map((voucher) => (
              <Card
                key={voucher.id}
                className={cn(
                  "rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-sm"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn("text-sm font-medium", text.primary)}>
                        {voucher.title}
                      </p>
                      <p className={cn("text-xs", text.muted)}>
                        {voucher.code && `Code: ${voucher.code}`}
                      </p>
                      {voucher.usedAt && (
                        <p className={cn("text-xs mt-1", text.muted)}>
                          Used on{" "}
                          {new Date(voucher.usedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <div className={cn("text-base font-semibold", text.primary)}>
                      ${voucher.value.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card
            className={cn(
              "rounded-xl border-none bg-white/80 shadow-sm backdrop-blur dark:border-purple-500/25 dark:bg-neutral-950/70"
            )}
          >
            <CardContent className="p-6 text-center">
              <p className={cn("text-xs", text.muted)}>No data yet</p>
            </CardContent>
          </Card>
        )}

          {/* Physical Voucher Option */}
          <div className="text-center">
            <p className={cn("text-xs", text.secondary)}>
              Have a physical voucher?{" "}
              <button
                onClick={handleScan}
                className={cn(
                  "text-green-400 dark:text-purple-400 hover:text-green-500 dark:hover:text-purple-400 text-sm font-medium transition-colors inline-flex items-center gap-1"
                )}
              >
                <QrCode className="h-4 w-4" />
                Scan
              </button>
            </p>
          </div>
        </div>
      </div>

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
              {dialogType === "success" ? "Continue" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCodeContent;

