"use client";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  Copy,
  Info,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

const CONTRACT_ADDRESS = "0x55d398326f99059ff775485246999027b3197955";
const NETWORK_LABEL = "BNB Smart Chain (BEP20)";
const CURRENCY_LABEL = "USDT";
const ARRIVAL_TIME = "≈ 1 min";
const WITHDRAWAL_TIME = "≈ 1 min";
const CURRENCY_ICON = "/usdt.png";

const FormDeposit = () => {
  const [copied, setCopied] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const {
    mutate: requestDepositAddress,
    data: depositData,
    isPending,
    isError,
    error,
    reset,
  } = trpc.user.generateDepositAddress.useMutation();

  useEffect(() => {
    requestDepositAddress();
  }, [requestDepositAddress]);

  const depositAddress = depositData?.address ?? "";
  
  // Get minimum amount from NOWPayments response, fallback to default
  const minCryptoAmount = depositData?.minPayAmount?.crypto;
  const minFiatAmount = depositData?.minPayAmount?.fiat;
  
  // Format minimum amount label
  const getMinAmountLabel = () => {
    if (minCryptoAmount !== undefined && minCryptoAmount > 0) {
      // Format with 2-6 decimal places depending on amount
      const formatted = minCryptoAmount >= 1
        ? minCryptoAmount.toFixed(2)
        : minCryptoAmount.toFixed(6);
      return `≥ ${formatted} ${CURRENCY_LABEL}`;
    }
    // Fallback if NOWPayments didn't return minimum
    return "≥ 0.8 USDT";
  };

  const MIN_AMOUNT_LABEL = getMinAmountLabel();

  useEffect(() => {
    let isMounted = true;

    if (!depositAddress) {
      setQrCodeDataUrl("");
      return () => {
        isMounted = false;
      };
    }

    const generateQRCode = async () => {
      try {
        const qrCodeDataURL = await QRCode.toDataURL(depositAddress, {
          width: 128,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        if (isMounted) {
          setQrCodeDataUrl(qrCodeDataURL);
        }
      } catch (qrError) {
        console.error("Error generating QR code:", qrError);
      }
    };

    generateQRCode();

    return () => {
      isMounted = false;
    };
  }, [depositAddress]);

  const handleCopy = (text: string, type: "address" | "contract") => {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "address") {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          setCopiedContract(true);
          setTimeout(() => setCopiedContract(false), 2000);
        }
      })
      .catch((copyError) => {
        console.error("Failed to copy text:", copyError);
      });
  };

  const handleShare = () => {
    if (!depositAddress) return;

    if (navigator.share) {
      navigator
        .share({
          title: "Deposit address",
          text: depositAddress,
        })
        .catch((shareError) => {
          console.error("Failed to share deposit address:", shareError);
        });
      return;
    }

    handleCopy(depositAddress, "address");
  };

  const handleRetry = () => {
    reset();
    setQrCodeDataUrl("");
    requestDepositAddress();
  };

  const maskedContractAddress = `${CONTRACT_ADDRESS.slice(
    0,
    6
  )}****${CONTRACT_ADDRESS.slice(-4)}`;

  return (
    <div className="w-full max-w-sm mx-auto px-4 pb-24 mt-6">
      {(isPending || isError) && (
        <div className="mb-4 text-center">
          {isPending && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Generating your deposit address…
            </p>
          )}
          {isError && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-left dark:border-red-900 dark:bg-red-900/30">
              <p className="text-xs text-red-700 dark:text-red-200">
                {error?.message ??
                  "Unable to generate a deposit address. Please try again."}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-auto px-2 py-1 text-xs"
                onClick={handleRetry}
              >
                <RefreshCcw className="mr-1 h-3 w-3" />
                Try again
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-600">
            {qrCodeDataUrl ? (
              <div className="relative flex h-32 w-32 items-center justify-center rounded">
                <Image
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  width={128}
                  height={128}
                  className="h-32 w-32"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg">
                    <Image
                      src={CURRENCY_ICON}
                      alt={CURRENCY_LABEL}
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-gray-400">
                  <span className="text-xs font-bold text-white">
                    {CURRENCY_LABEL.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              Deposit network
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {NETWORK_LABEL}
            </p>
          </div>
          <ArrowLeftRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Deposit Address
          </p>
          <ArrowRight className="h-3 w-3 text-gray-400" />
        </div>
        <p className="mb-3 break-all font-mono text-xs leading-relaxed text-gray-900 dark:text-gray-100">
          {depositAddress || "Awaiting deposit address..."}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            disabled={!depositAddress || isPending}
            className="flex-1 rounded-lg bg-purple-600 py-2 text-xs font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Copy className="mr-1 h-3 w-3" />
            Share &amp; Save
          </Button>
          <Button
            disabled={!depositAddress || isPending}
            onClick={() => handleCopy(depositAddress, "address")}
            className="h-10 w-10 rounded-lg bg-purple-600 p-0 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Minimum Deposit
          </span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {isPending ? "Loading..." : MIN_AMOUNT_LABEL}
          </span>
        </div>
        
        {minFiatAmount !== undefined && minFiatAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Minimum (USD)
            </span>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
              ${minFiatAmount.toFixed(2)} USD
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Receiving account
            </span>
            <Info className="ml-1 h-3 w-3 text-gray-400" />
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
              Exar Account
            </span>
            <ArrowLeftRight className="ml-2 h-3 w-3 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Arrival time
            </span>
            <Info className="ml-1 h-3 w-3 text-gray-400" />
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {ARRIVAL_TIME}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Withdrawal available
            </span>
            <Info className="ml-1 h-3 w-3 text-gray-400" />
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {WITHDRAWAL_TIME}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Contract address
          </span>
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {maskedContractAddress}
            </span>
            <Button
              onClick={() => handleCopy(CONTRACT_ADDRESS, "contract")}
              size="sm"
              variant="ghost"
              className="ml-2 h-auto w-auto p-1"
            >
              {copiedContract ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-start">
          <Info className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            Send only {CURRENCY_LABEL} on the Binance Smart Chain to this
            deposit address. Sending any other asset or network type will result
            in a permanent loss of funds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormDeposit;
