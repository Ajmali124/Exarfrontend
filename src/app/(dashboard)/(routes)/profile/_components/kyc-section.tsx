"use client";

import { useMemo, useRef, useState } from "react";
import { trpc } from "@/trpc/client";
import { useThemeClasses } from "@/lib/theme-utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, IdCard, Loader2, ShieldCheck, UploadCloud, UserRoundCheck } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function flagEmoji(regionCode: string): string {
  const code = regionCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + (code.charCodeAt(0) - 65),
    A + (code.charCodeAt(1) - 65)
  );
}

type CountryOption = { code: string; name: string; flag: string };

function getCountryOptions(): CountryOption[] {
  try {
    const supported =
      typeof (Intl as any).supportedValuesOf === "function"
        ? ((Intl as any).supportedValuesOf("region") as string[])
        : [];
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    const codes = supported.filter((c) => /^[A-Z]{2}$/.test(c));
    const list = (codes.length ? codes : ["PK", "AE", "SA", "US", "GB"]).map(
      (code) => ({
        code,
        name: display.of(code) ?? code,
        flag: flagEmoji(code),
      })
    );
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [
      { code: "PK", name: "Pakistan", flag: "🇵🇰" },
      { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
      { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
      { code: "US", name: "United States", flag: "🇺🇸" },
      { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    ];
  }
}

function KycBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: "secondary" | "outline" | "destructive" | "default" }
  > = {
    not_submitted: { label: "Not started", variant: "secondary" },
    submitted: { label: "Submitted", variant: "outline" },
    approved: { label: "Approved", variant: "default" },
    rejected: { label: "Rejected", variant: "destructive" },
    info: { label: "Info", variant: "secondary" },
  };
  const resolved = map[status] ?? map.info;
  return (
    <Badge
      variant={resolved.variant}
      className={cn(
        resolved.variant === "default" &&
          "bg-emerald-600 hover:bg-emerald-600 text-white",
        resolved.variant === "outline" &&
          "border-amber-300 text-amber-800 dark:border-amber-700 dark:text-amber-200"
      )}
    >
      {resolved.label}
    </Badge>
  );
}

function KycCard({
  title,
  subtitle,
  icon,
  status,
  action,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: string;
  action?: React.ReactNode;
}) {
  const themeClasses = useThemeClasses();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const shellClasses = isDark
    ? "bg-gradient-to-br from-[#101220] via-[#090b16] to-[#05060c] border-white/10 shadow-[0_30px_90px_rgba(3,5,12,0.45)]"
    : "bg-gradient-to-br from-white via-white to-slate-50 border-white/70 shadow-[0_15px_45px_rgba(15,23,42,0.05)]";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border px-4 py-5 sm:px-6 sm:py-6 flex items-start justify-between gap-4",
        shellClasses
      )}
    >
      <div className="pointer-events-none absolute -right-16 top-6 h-32 w-32 rounded-full bg-white/40 blur-[80px] dark:bg-purple-500/30" />
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={cn(
            "h-10 w-10 rounded-2xl flex items-center justify-center border",
            themeClasses.bg.secondary,
            themeClasses.border.primary
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn("text-sm font-semibold", themeClasses.text.primary)}>
              {title}
            </p>
            <KycBadge status={status} />
          </div>
          <p className={cn("text-xs mt-1", themeClasses.text.muted)}>{subtitle}</p>
        </div>
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  );
}

function BasicKycDialog({
  currentStatus,
  disabled,
  onSubmit,
}: {
  currentStatus: string;
  disabled: boolean;
  onSubmit: (payload: {
    fullName: string;
    address: string;
    selfieImageUrl: string;
  }) => void;
}) {
  const themeClasses = useThemeClasses();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [countryCode, setCountryCode] = useState("PK");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const selfieCameraInputRef = useRef<HTMLInputElement>(null);
  const selfieGalleryInputRef = useRef<HTMLInputElement>(null);
  const [selfieFileName, setSelfieFileName] = useState<string>("");

  const countryOptions = useMemo(() => getCountryOptions(), []);
  const selectedCountry = useMemo(
    () => countryOptions.find((c) => c.code === countryCode),
    [countryOptions, countryCode]
  );

  const uploadSelfie = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/kyc/upload?kind=selfie", {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Upload failed");
      setSelfieUrl(json.url);
      toast.success("Selfie uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadChipClasses = isDark
    ? "bg-white/5 text-white border-white/10"
    : "bg-white/70 text-gray-900 border-black/5";

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setStep(1);
      }}
    >
      <KycCard
        title="Basic KYC"
        subtitle="Upload name, address and a selfie"
        icon={<UserRoundCheck className="h-5 w-5" />}
        status={currentStatus}
        action={
          <SheetTrigger asChild>
            <Button
              size="sm"
              disabled={disabled}
              className={cn(
                "rounded-[10px] bg-gradient-to-r px-4 py-2 text-xs font-semibold tracking-wide shadow-lg transition hover:brightness-110",
                isDark
                  ? "from-[#6C3EF6] via-[#8C5CFF] to-[#B388FF] text-white"
                  : "from-[#34D399] via-[#10B981] to-[#059669] text-white"
              )}
            >
              {currentStatus === "approved" ? "View" : "Start"}
            </Button>
          </SheetTrigger>
        }
      />
      <SheetContent
        side="bottom"
        className={cn(
          "rounded-t-2xl border-t p-0",
          // Mobile-first: make it feel like a real app sheet (at least 70% height).
          "min-h-[70vh] h-[80vh] max-h-[90vh]",
          "flex flex-col",
          "pb-[calc(env(safe-area-inset-bottom)+16px)]"
        )}
      >
        <div className="px-4 pt-3">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200 dark:bg-neutral-800" />
        </div>
        <SheetHeader className="px-4 pb-0">
          <SheetTitle>Basic KYC</SheetTitle>
          <SheetDescription>
            Enter your legal name and address, then upload a selfie.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pt-3">
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span className={cn(step === 1 && "text-gray-900 dark:text-gray-100 font-semibold")}>
                1. Details
              </span>
              <span className={cn(step === 2 && "text-gray-900 dark:text-gray-100 font-semibold")}>
                2. Selfie
              </span>
            </div>
            <Progress value={step === 1 ? 50 : 100} className="mt-2 h-2" />
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Full legal name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={cn(themeClasses.input, "h-11 rounded-xl px-4")}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Street address</Label>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street / House no."
                  className={cn(themeClasses.input, "h-11 rounded-xl px-4")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className={cn(themeClasses.input, "h-11 rounded-xl px-4")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Province / State</Label>
                  <Input
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Province"
                    className={cn(themeClasses.input, "h-11 rounded-xl px-4")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Country</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className={cn(themeClasses.input, "h-11 rounded-xl px-4")}>
                    <SelectValue placeholder="Select country">
                      {selectedCountry
                        ? `${selectedCountry.flag} ${selectedCountry.name}`
                        : "Select country"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[55vh]">
                    {countryOptions.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs">Selfie photo</Label>

            {/* Hidden inputs for camera vs gallery */}
            <input
              ref={selfieCameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setSelfieFileName(file.name);
                void uploadSelfie(file);
              }}
              disabled={uploading}
            />
            <input
              ref={selfieGalleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setSelfieFileName(file.name);
                void uploadSelfie(file);
              }}
              disabled={uploading}
            />

            {/* Big centered selfie upload area */}
            <div
              className={cn(
                "rounded-2xl border p-4",
                themeClasses.border.primary,
                isDark ? "bg-white/5" : "bg-white"
              )}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div
                  className={cn(
                    "relative h-36 w-36 rounded-full overflow-hidden border",
                    isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-slate-50"
                  )}
                >
                  {selfieUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selfieUrl}
                      alt="Selfie preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-center px-4">
                      {uploading ? (
                        <Loader2 className="h-7 w-7 animate-spin text-gray-600 dark:text-gray-200" />
                      ) : (
                        <UploadCloud className="h-7 w-7 text-gray-600 dark:text-gray-200" />
                      )}
                      <p className={cn("mt-2 text-xs", themeClasses.text.muted)}>
                        {uploading
                          ? "Uploading…"
                          : selfieFileName
                            ? selfieFileName
                            : "Add a clear selfie"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => selfieCameraInputRef.current?.click()}
                    disabled={uploading}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition",
                      uploadChipClasses,
                      uploading && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => selfieGalleryInputRef.current?.click()}
                    disabled={uploading}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition",
                      uploadChipClasses,
                      uploading && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    <UploadCloud className="h-4 w-4" />
                    Photos
                  </button>
                </div>

                <p className={cn("text-[11px] text-center", themeClasses.text.muted)}>
                  Tip: Make sure your face is well-lit and clearly visible.
                </p>
              </div>
            </div>
            </div>
          )}
        </div>
        <SheetFooter className="px-4 bg-background border-t">
          {step === 1 ? (
            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={
                disabled ||
                !fullName.trim() ||
                !street.trim() ||
                !city.trim() ||
                !province.trim() ||
                !countryCode
              }
              className={cn(
                "w-full rounded-[10px] bg-gradient-to-r px-4 py-3 text-sm font-semibold tracking-wide shadow-lg transition hover:brightness-110",
                isDark
                  ? "from-[#6C3EF6] via-[#8C5CFF] to-[#B388FF] text-white"
                  : "from-[#34D399] via-[#10B981] to-[#059669] text-white"
              )}
            >
              Next
            </Button>
          ) : (
            <div className="w-full grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const countryName = selectedCountry?.name ?? countryCode;
                  const address = `${street.trim()}, ${city.trim()}, ${province.trim()}, ${countryName}`.trim();
                  onSubmit({
                    fullName: fullName.trim(),
                    address,
                    selfieImageUrl: selfieUrl,
                  });
                  setOpen(false);
                }}
                disabled={!selfieUrl || disabled}
                className={cn(
                  "rounded-[10px] bg-gradient-to-r px-4 py-3 text-sm font-semibold tracking-wide shadow-lg transition hover:brightness-110",
                  isDark
                    ? "from-[#6C3EF6] via-[#8C5CFF] to-[#B388FF] text-white"
                    : "from-[#34D399] via-[#10B981] to-[#059669] text-white"
                )}
              >
                Submit
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function AdvancedKycDialog({
  currentStatus,
  basicStatus,
  disabled,
  onSubmit,
}: {
  currentStatus: string;
  basicStatus: string;
  disabled: boolean;
  onSubmit: (payload: {
    documentType: "passport" | "id_card";
    documentFrontUrl: string;
    documentBackUrl?: string;
  }) => void;
}) {
  const themeClasses = useThemeClasses();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState<"passport" | "id_card">("passport");
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const frontCameraInputRef = useRef<HTMLInputElement>(null);
  const frontGalleryInputRef = useRef<HTMLInputElement>(null);
  const backCameraInputRef = useRef<HTMLInputElement>(null);
  const backGalleryInputRef = useRef<HTMLInputElement>(null);
  const [frontFileName, setFrontFileName] = useState<string>("");
  const [backFileName, setBackFileName] = useState<string>("");

  const canStart = basicStatus !== "not_submitted";

  const uploadDoc = async (
    kind: "document_front" | "document_back",
    file: File
  ) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/kyc/upload?kind=${kind}`, {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Upload failed");
      if (kind === "document_front") setFrontUrl(json.url);
      else setBackUrl(json.url);
      toast.success("Document uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadChipClasses = isDark
    ? "bg-white/5 text-white border-white/10"
    : "bg-white/70 text-gray-900 border-black/5";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <KycCard
        title="Advanced KYC"
        subtitle="Upload your Passport or ID card (auto-approved for now)"
        icon={<IdCard className="h-5 w-5" />}
        status={currentStatus}
        action={
          <SheetTrigger asChild>
            <Button
              size="sm"
              disabled={!canStart || disabled}
              className={cn(
                "rounded-[10px] bg-gradient-to-r px-4 py-2 text-xs font-semibold tracking-wide shadow-lg transition hover:brightness-110 disabled:opacity-60",
                isDark
                  ? "from-[#6C3EF6] via-[#8C5CFF] to-[#B388FF] text-white"
                  : "from-[#34D399] via-[#10B981] to-[#059669] text-white"
              )}
            >
              {currentStatus === "approved" ? "View" : "Start"}
            </Button>
          </SheetTrigger>
        }
      />
      <SheetContent
        side="bottom"
        className={cn(
          "rounded-t-2xl border-t p-0",
          // Mobile-first: make it feel like a real app sheet (at least 70% height).
          "min-h-[70vh] h-[80vh] max-h-[90vh]",
          "flex flex-col",
          "pb-[calc(env(safe-area-inset-bottom)+16px)]"
        )}
      >
        <div className="px-4 pt-3">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200 dark:bg-neutral-800" />
        </div>
        <SheetHeader className="px-4 pb-0">
          <SheetTitle>Advanced KYC</SheetTitle>
          <SheetDescription>
            Upload your ID card or passport.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pt-2">
          {!canStart ? (
            <p className="text-sm text-red-600">Complete Basic KYC first.</p>
          ) : (
            <div className="space-y-3">
            <Select value={docType} onValueChange={(val) => setDocType(val as any)}>
              <SelectTrigger className={themeClasses.input}>
                <SelectValue placeholder="Document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="id_card">ID Card</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <label className={cn("text-xs font-medium", themeClasses.text.muted)}>
                Document front
              </label>
              {/* Hidden inputs for camera vs gallery */}
              <input
                ref={frontCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFrontFileName(file.name);
                  void uploadDoc("document_front", file);
                }}
                disabled={uploading}
              />
              <input
                ref={frontGalleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFrontFileName(file.name);
                  void uploadDoc("document_front", file);
                }}
                disabled={uploading}
              />

              <div
                className={cn(
                  "rounded-2xl border p-4",
                  themeClasses.border.primary,
                  isDark ? "bg-white/5" : "bg-white"
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "relative w-full h-32 rounded-xl overflow-hidden border",
                      isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-slate-50"
                    )}
                  >
                    {frontUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={frontUrl}
                        alt="Document front preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-center px-4">
                        {uploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-gray-600 dark:text-gray-200" />
                        ) : (
                          <UploadCloud className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                        )}
                        <p className={cn("mt-2 text-xs", themeClasses.text.muted)}>
                          {frontFileName ? frontFileName : "Upload front side"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => frontCameraInputRef.current?.click()}
                      disabled={uploading}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition",
                        uploadChipClasses,
                        uploading && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UploadCloud className="h-4 w-4" />
                      )}
                      Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => frontGalleryInputRef.current?.click()}
                      disabled={uploading}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition",
                        uploadChipClasses,
                        uploading && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      <UploadCloud className="h-4 w-4" />
                      Photos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {docType === "id_card" ? (
              <div className="space-y-2">
                <label className={cn("text-xs font-medium", themeClasses.text.muted)}>
                  Document back (optional)
                </label>
                {/* Hidden inputs for camera vs gallery */}
                <input
                  ref={backCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBackFileName(file.name);
                    void uploadDoc("document_back", file);
                  }}
                  disabled={uploading}
                />
                <input
                  ref={backGalleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBackFileName(file.name);
                    void uploadDoc("document_back", file);
                  }}
                  disabled={uploading}
                />

                <div
                  className={cn(
                    "rounded-2xl border p-4",
                    themeClasses.border.primary,
                    isDark ? "bg-white/5" : "bg-white"
                  )}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={cn(
                        "relative w-full h-32 rounded-xl overflow-hidden border",
                        isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-slate-50"
                      )}
                    >
                      {backUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={backUrl}
                          alt="Document back preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-center px-4">
                          {uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-gray-600 dark:text-gray-200" />
                          ) : (
                            <UploadCloud className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                          )}
                          <p className={cn("mt-2 text-xs", themeClasses.text.muted)}>
                            {backFileName ? backFileName : "Upload back side (optional)"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => backCameraInputRef.current?.click()}
                        disabled={uploading}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition",
                          uploadChipClasses,
                          uploading && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UploadCloud className="h-4 w-4" />
                        )}
                        Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => backGalleryInputRef.current?.click()}
                        disabled={uploading}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition",
                          uploadChipClasses,
                          uploading && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        <UploadCloud className="h-4 w-4" />
                        Photos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            </div>
          )}
        </div>
        <SheetFooter className="px-4 bg-background border-t">
          <Button
            type="button"
            onClick={() => {
              onSubmit({
                documentType: docType,
                documentFrontUrl: frontUrl,
                documentBackUrl: backUrl || undefined,
              });
              setOpen(false);
            }}
            disabled={!canStart || !frontUrl || disabled}
            className={cn(
              "w-full rounded-[10px] bg-gradient-to-r px-4 py-3 text-sm font-semibold tracking-wide shadow-lg transition hover:brightness-110 disabled:opacity-60",
              isDark
                ? "from-[#6C3EF6] via-[#8C5CFF] to-[#B388FF] text-white"
                : "from-[#34D399] via-[#10B981] to-[#059669] text-white"
            )}
          >
            Submit
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const KycSection = () => {
  const themeClasses = useThemeClasses();
  const utils = trpc.useUtils();

  const { data: kycStatus } = trpc.user.getKycStatus.useQuery();
  const basicStatus = kycStatus?.basicStatus ?? "not_submitted";
  const advancedStatus = kycStatus?.advancedStatus ?? "not_submitted";
  const stepsDone =
    (basicStatus === "approved" ? 1 : 0) + (advancedStatus === "approved" ? 1 : 0);
  const progressValue = Math.round((stepsDone / 2) * 100);

  const submitBasicKyc = trpc.user.submitBasicKyc.useMutation({
    onSuccess: () => {
      toast.success("Basic KYC approved");
      void utils.user.getKycStatus.invalidate();
      void utils.user.getBasicInfo.invalidate();
    },
    onError: (error) =>
      toast.error(error.message ?? "Failed to submit Basic KYC"),
  });

  const submitAdvancedKyc = trpc.user.submitAdvancedKyc.useMutation({
    onSuccess: () => {
      toast.success("Advanced KYC approved");
      void utils.user.getKycStatus.invalidate();
    },
    onError: (error) =>
      toast.error(error.message ?? "Failed to submit Advanced KYC"),
  });

  return (
    <section className="space-y-3">
      <div
        className={cn(
          "rounded-2xl border p-4",
          themeClasses.border.primary,
          themeClasses.bg.card
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={cn("text-sm font-semibold", themeClasses.text.primary)}>
              Verification progress
            </p>
            {/* <p className={cn("mt-1 text-xs", themeClasses.text.muted)}>
              Auto-approve (for now)
            </p> */}
          </div>
          {progressValue === 100 ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Verified
            </span>
          ) : (
            <span className={cn("text-xs font-semibold", themeClasses.text.muted)}>
              {stepsDone}/2
            </span>
          )}
        </div>
        <div className="mt-3">
          <Progress value={progressValue} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <KycCard
          title="Introduction"
          subtitle="Verify your identity to unlock full access"
          icon={<ShieldCheck className="h-5 w-5" />}
          status="info"
        />

        <BasicKycDialog
          disabled={submitBasicKyc.isPending}
          currentStatus={basicStatus}
          onSubmit={(payload) => submitBasicKyc.mutate(payload)}
        />

        <AdvancedKycDialog
          disabled={submitAdvancedKyc.isPending}
          currentStatus={advancedStatus}
          basicStatus={basicStatus}
          onSubmit={(payload) => submitAdvancedKyc.mutate(payload)}
        />
      </div>
    </section>
  );
};

