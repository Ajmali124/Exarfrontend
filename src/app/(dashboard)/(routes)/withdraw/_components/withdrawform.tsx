"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/trpc/client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Info, Loader2, TriangleAlert } from "lucide-react";

const WithdrawForm = () => {
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { data: walletData } = trpc.user.getWalletBalance.useQuery();
  const { data: withdrawalSettings, isLoading: settingsLoading } =
    trpc.user.getWithdrawalSettings.useQuery();

  const requestWithdrawal = trpc.user.requestWithdrawal.useMutation();

  const balance = walletData?.balance ?? 0;
  const minAmount = withdrawalSettings?.minAmount ?? null;
  const minAmountDisplay = minAmount ? minAmount.toFixed(6) : null;

  const parsedAmount = useMemo(() => {
    const parsed = Number(amount);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [amount]);

  const amountInvalid = Number.isNaN(parsedAmount) || parsedAmount <= 0;
  const exceedsBalance =
    !Number.isNaN(parsedAmount) && parsedAmount > balance + Number.EPSILON;
  const belowMinimum =
    minAmount !== null &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount + Number.EPSILON < minAmount;
  const addressInvalid = address.trim().length < 10;

  const canSubmit =
    !amountInvalid &&
    !exceedsBalance &&
    !belowMinimum &&
    !addressInvalid &&
    !requestWithdrawal.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);

    if (!canSubmit) {
      return;
    }

    requestWithdrawal.mutate(
      {
        amount: parsedAmount,
        address: address.trim(),
      },
      {
        onSuccess: () => {
          setAmount("");
          setAddress("");
        },
      }
    );
  };

  useEffect(() => {
    if (requestWithdrawal.isSuccess) {
      const timeout = setTimeout(() => {
        setHasSubmitted(false);
        requestWithdrawal.reset();
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [requestWithdrawal]);

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-24 mt-6 space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Withdrawals use NOWPayments custody. Configure{" "}
            <code>NOWPAYMENTS_PAYOUT_EMAIL</code>,{" "}
            <code>NOWPAYMENTS_PAYOUT_PASSWORD</code>, and{" "}
            <code>NOWPAYMENTS_IPN_URL</code> in your environment before using
            this form.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
        <p className="font-medium">Available balance</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {balance.toFixed(2)} USDT
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="withdraw-amount">Amount</Label>
          <Input
            id="withdraw-amount"
            type="number"
            min="0"
            step="0.000001"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={minAmountDisplay ?? "Enter amount in USDT"}
          />
          {hasSubmitted && amountInvalid && (
            <p className="text-xs text-red-500">
              Please enter a positive withdrawal amount.
            </p>
          )}
          {hasSubmitted && exceedsBalance && (
            <p className="text-xs text-red-500">
              Amount exceeds your available balance.
            </p>
          )}
          {hasSubmitted && belowMinimum && (
            <p className="text-xs text-red-500">
              Minimum withdrawal is {minAmountDisplay} USDT (BNB Smart Chain).
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="withdraw-address">Destination address</Label>
          <Input
            id="withdraw-address"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter BEP-20 (BNB Smart Chain) address"
          />
          {hasSubmitted && addressInvalid && (
            <p className="text-xs text-red-500">
              Please enter a valid BNB Smart Chain address.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
          <p className="flex items-center gap-2 font-medium">
            <Info className="h-3.5 w-3.5" />
            Withdrawal summary
          </p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Asset: USDT (BNB Smart Chain, BEP-20)</li>
            {minAmountDisplay ? (
              <li>Provider minimum: ≥ {minAmountDisplay} USDT</li>
            ) : (
              <li>
                Minimum unavailable. Ensure NOWPAYMENTS_API_KEY is configured.
              </li>
            )}
            <li>Network fees are handled by NOWPayments.</li>
          </ul>
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          disabled={!canSubmit}
        >
          {requestWithdrawal.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing withdrawal
            </>
          ) : (
            "Submit withdrawal"
          )}
        </Button>
      </form>

      {requestWithdrawal.isSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          Withdrawal requested successfully. ID:{" "}
          {requestWithdrawal.data.withdrawalId}
        </div>
      )}

      {requestWithdrawal.isError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
          <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{requestWithdrawal.error.message}</p>
        </div>
      )}

      {settingsLoading && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Fetching withdrawal limits…
        </div>
      )}
    </div>
  );
};

export default WithdrawForm;

