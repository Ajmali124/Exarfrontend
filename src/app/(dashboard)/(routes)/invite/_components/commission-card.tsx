'use client';

import React from "react";
import QRCode from "qrcode";
import { QrCode, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/context/ThemeContext";
import { useThemeClasses } from "@/lib/theme-utils";

interface CommissionCardProps {
  commissionRate: number;
  referralCode?: string | null;
  referralLink?: string | null;
}

const CommissionCard: React.FC<CommissionCardProps> = ({
  commissionRate,
  referralCode,
  referralLink,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { text } = useThemeClasses();

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // no-op for now
    }
  };

  const shellClasses = isDark
    ? "bg-gradient-to-br from-[#101220] via-[#090b16] to-[#05060c] border-white/10 shadow-[0_30px_90px_rgba(3,5,12,0.45)]"
    : "bg-gradient-to-br from-white via-white to-slate-50 border-white/70 shadow-[0_15px_45px_rgba(15,23,42,0.05)]";

  const chipClasses = isDark
    ? "bg-white/5 text-white border-white/10"
    : "bg-white/70 text-gray-900 border-black/5";

  const infoCardClasses = isDark
    ? "bg-black/30 border-white/10"
    : "bg-white border-slate-100";

  const dashedClasses = isDark ? "border-white/20 text-white" : "border-slate-200 text-gray-900";

  const referButtonClasses = isDark
    ? "from-[#6C3EF6] via-[#8C5CFF] to-[#B388FF] text-white"
    : "from-[#34D399] via-[#10B981] to-[#059669] text-white";

  const [isQrDialogOpen, setIsQrDialogOpen] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = React.useState(false);
  const [qrGenerationError, setQrGenerationError] = React.useState<string | null>(null);
  const [copiedTarget, setCopiedTarget] = React.useState<"code" | "link" | null>(null);
  const copyResetTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!isQrDialogOpen || !referralLink) return;

    const targetLink = referralLink;

    let cancelled = false;

    async function generateQr() {
      try {
        setIsGeneratingQr(true);
        setQrGenerationError(null);
        const dataUrl = await QRCode.toDataURL(targetLink, {
          width: 320,
          margin: 1,
          color: {
            dark: isDark ? "#ffffff" : "#000000",
            light: isDark ? "#111111" : "#ffffff",
          },
        });
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch (error) {
        if (!cancelled) {
          setQrGenerationError("Unable to generate QR code right now.");
        }
      } finally {
        if (!cancelled) {
          setIsGeneratingQr(false);
        }
      }
    }

    generateQr();

    return () => {
      cancelled = true;
    };
  }, [isQrDialogOpen, referralLink, isDark]);

  React.useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async (value: string | null | undefined, target: "code" | "link") => {
    if (!value) {
      return;
    }
    await copyToClipboard(value);
    setCopiedTarget(target);
    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
    }
    copyResetTimeoutRef.current = setTimeout(() => {
      setCopiedTarget(null);
    }, 2000);
  };

  const handleShare = async () => {
    if (!referralLink) {
      return;
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join me on ExarPro",
          text: "Use my referral link to earn rewards.",
          url: referralLink,
        });
        return;
      } catch (error) {
        // Ignore abort errors silently
      }
    }
    await handleCopy(referralLink, "link");
  };

  const hasReferralCode = Boolean(referralCode);
  const hasReferralLink = Boolean(referralLink);
  const displayReferralCode = hasReferralCode ? referralCode : "--";
  const displayReferralLink = hasReferralLink
    ? referralLink
    : "Referral link will appear here once it is generated.";

  return (
    <div className={`relative overflow-hidden rounded-md border px-4 py-5 sm:px-6 sm:py-6 ${shellClasses}`}>
      <div className="pointer-events-none absolute -right-16 top-6 h-32 w-32 rounded-full bg-white/40 blur-[80px] dark:bg-purple-500/30" />
      <div className="relative space-y-3.5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={`${text.secondary} text-sm uppercase tracking-[0.2em]`}>My Commission</p>
            <p className="mt-1 text-lg font-black tracking-tight text-gray-900 dark:text-white leading-none">
              {commissionRate}%
            </p>
          </div>

        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className={`${text.secondary} text-sm`}>Referral Code</p>
            <p className={`${text.primary} text-2xl font-semibold tracking-wide`}>{displayReferralCode}</p>
          </div>
          <button
            onClick={() => handleCopy(referralCode, "code")}
            disabled={!hasReferralCode}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition ${
              hasReferralCode
                ? "border-white/30 text-gray-900 dark:text-white"
                : "border-gray-200 text-gray-400 cursor-not-allowed dark:border-white/10 dark:text-white/40"
            }`}
          >
            {copiedTarget === "code" ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>

        <div className={`flex items-start gap-3 rounded-md border-2 border-dashed px-3 py-2.5 ${dashedClasses}`}>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-70">Referral Link</p>
            <p
              className={`truncate text-sm font-medium ${
                hasReferralLink ? "" : "text-gray-400 dark:text-white/40"
              }`}
            >
              {displayReferralLink}
            </p>
          </div>
          <button
            onClick={() => handleCopy(referralLink, "link")}
            disabled={!hasReferralLink}
            className={`mt-1 inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
              hasReferralLink
                ? "border-current/30"
                : "border-gray-200 text-gray-400 cursor-not-allowed dark:border-white/10 dark:text-white/40"
            }`}
          >
            {copiedTarget === "link" ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      

        <div className="flex items-center gap-3">
          <Dialog
            open={isQrDialogOpen && hasReferralLink}
            onOpenChange={(open) => {
              if (!hasReferralLink) return;
              setIsQrDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <button
                disabled={!hasReferralLink}
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold ${
                  hasReferralLink
                    ? isDark
                      ? "border-white/20 bg-white/5 text-white"
                      : "border-black/5 bg-white text-gray-900"
                    : "border-gray-200 text-gray-400 cursor-not-allowed bg-white/70 dark:border-white/10 dark:text-white/40 dark:bg-white/5"
                }`}
              >
                <QrCode className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-lg">Referral QR</DialogTitle>
                <DialogDescription className="text-center break-all text-xs text-muted-foreground">
                  {displayReferralLink}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center gap-3 py-4">
                {isGeneratingQr && <p className="text-sm text-muted-foreground">Generating QR...</p>}
                {!isGeneratingQr && qrGenerationError && (
                  <p className="text-sm text-destructive">{qrGenerationError}</p>
                )}
                {!isGeneratingQr && !qrGenerationError && qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Referral QR"
                    className="h-56 w-56 rounded-xl border border-border bg-white p-4 dark:bg-black"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
          <button
            onClick={handleShare}
            disabled={!hasReferralLink}
            className={`flex-1 rounded-[10px] bg-gradient-to-r px-4 py-3 text-sm font-semibold tracking-wide shadow-lg transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed ${referButtonClasses}`}
          >
            Refer Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionCard;

