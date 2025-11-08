"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Copy,
  Pencil,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { useThemeClasses } from "@/lib/theme-utils";

export type ProfileBasicInfo = {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  image: string | null;
  nickname: string | null;
  gender: string | null;
  homepage: string | null;
  location: string | null;
  linkEmail: string | null;
  inviteCode: string | null;
};

interface ProfileScreenClientProps {
  basicInfo: ProfileBasicInfo;
}

type ThemeClassTokens = ReturnType<typeof useThemeClasses>;

type EditableField =
  | "nickname"
  | "gender"
  | "homepage"
  | "location"
  | "linkEmail";

interface EditableRowConfig {
  label: string;
  value: string;
  display: string;
  field: EditableField;
  type: "text" | "url" | "email" | "gender";
}

const ProfileScreenClient = ({ basicInfo }: ProfileScreenClientProps) => {
  const uid = basicInfo.id;
  const displayName =
    basicInfo.name || basicInfo.username || basicInfo.email || "User";

  const [profile, setProfile] = useState(basicInfo);
  const [copied, setCopied] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const themeClasses = useThemeClasses();

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: (data) => {
      setProfile((prev) => ({ ...prev, ...data }));
      toast.success("Profile updated");
      void utils.user.getBasicInfo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update profile");
    },
  });

  const handleAvatarSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error ?? "Upload failed");
      }

      const { url } = (await response.json()) as { url: string };
      setProfile((prev) => ({ ...prev, image: url }));
      toast.success("Profile photo updated");
      void utils.user.getBasicInfo.invalidate();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCopyUid = async () => {
    if (!uid) return;
    try {
      await navigator.clipboard?.writeText(uid);
    } catch (error) {
      console.error("Failed to copy UID", error);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const editableRows: EditableRowConfig[] = useMemo(
    () => [
      {
        label: "Nickname",
        value: profile.nickname ?? "",
        display: profile.nickname ?? "Not Set",
        field: "nickname",
        type: "text",
      },
      {
        label: "Gender",
        value: profile.gender ?? "unknown",
        display: formatGender(profile.gender),
        field: "gender",
        type: "gender",
      },
      {
        label: "Homepage",
        value: profile.homepage ?? "",
        display: profile.homepage ?? "Not Set",
        field: "homepage",
        type: "url",
      },
      {
        label: "Location",
        value: profile.location ?? "",
        display: profile.location ?? "Not Set",
        field: "location",
        type: "text",
      },
      {
        label: "Link Email",
        value: profile.linkEmail ?? "",
        display: profile.linkEmail ? maskEmail(profile.linkEmail) : "Not Set",
        field: "linkEmail",
        type: "email",
      },
    ],
    [profile]
  );

  const staticRows = useMemo(
    () => [
      {
        label: "Avatar Frame",
        value: "Not Set",
      },
      {
        label: "My Referrer",
        value: profile.inviteCode ?? "Not Set",
      },
    ],
    [profile.inviteCode]
  );

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-colors",
        themeClasses.bg.primary,
        themeClasses.text.primary
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-900/70",
          themeClasses.border.primary
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "rounded-full p-2 transition",
            themeClasses.bg.secondary,
            themeClasses.text.secondary,
            "hover:opacity-80"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-base font-semibold">Personal Info</h1>
        <div className="h-8 w-8" />
      </header>

      <main className={cn("flex-1 px-6 pb-12", themeClasses.bg.primary)}>
        <section className="flex flex-col items-center gap-3 pb-6 pt-6">
          <div className="relative">
            <div
              className={cn(
                "relative h-24 w-24 overflow-hidden rounded-full border",
                themeClasses.bg.secondary,
                themeClasses.border.primary
              )}
            >
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center text-2xl font-semibold",
                    themeClasses.text.muted
                  )}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {isUploadingAvatar ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow dark:bg-neutral-800 dark:text-white"
              disabled={isUploadingAvatar}
            >
              <Pencil className="h-4 w-4 text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>
          <div className={cn("flex flex-col items-center gap-2 text-sm", themeClasses.text.muted)}>
            <span className="text-xs">UID {maskUid(uid)}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyUid}
              className={cn(
                "h-8 rounded-full border-gray-300 px-3 text-xs text-gray-700 hover:bg-gray-100 transition-colors",
                copied &&
                  "border-green-500 bg-green-50 text-green-600 hover:bg-green-100"
              )}
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5" />
                  Copy UID
                </span>
              )}
            </Button>
          </div>
        </section>

        <section
          className={cn(
            "divide-y rounded-2xl border",
            themeClasses.border.primary,
            themeClasses.bg.card
          )}
        >
          {editableRows.map((row) => (
            <EditableProfileRow
              key={row.label}
              row={row}
              onSave={(value) => updateProfile.mutate({ [row.field]: value })}
              isSaving={updateProfile.isPending}
              disabled={
                row.field === "linkEmail" && !profile.email
              }
              themeClasses={themeClasses}
            />
          ))}
          {staticRows.map((row) => (
            <StaticProfileRow
              key={row.label}
              label={row.label}
              value={row.value}
              themeClasses={themeClasses}
            />
          ))}
        </section>
      </main>
    </div>
  );
};

const EditableProfileRow = ({
  row,
  onSave,
  isSaving,
  disabled,
  themeClasses,
}: {
  row: EditableRowConfig;
  onSave: (value: string) => void;
  isSaving: boolean;
  disabled?: boolean;
  themeClasses: ThemeClassTokens;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(row.value);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setValue(row.value);
    }
  };

  const handleSave = () => {
    const nextValue =
      row.type === "gender" ? value : value.trim();
    onSave(nextValue);
    setOpen(false);
  };

  const handleClear = () => {
    if (row.type === "gender") {
      onSave("unknown");
    } else {
      onSave("");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center justify-between px-4 py-4 text-left transition",
            "hover:bg-gray-50 dark:hover:bg-white/5",
            disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
          )}
          disabled={disabled}
        >
          <div className="flex flex-1 items-center justify-between">
            <span className={cn("text-sm", themeClasses.text.primary)}>
              {row.label}
            </span>
            <span className={cn("text-sm", themeClasses.text.muted)}>
              {row.display.length ? row.display : "Not Set"}
            </span>
          </div>
          <ChevronRight className="ml-2 h-4 w-4 text-gray-300 dark:text-gray-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit {row.label}</DialogTitle>
          <DialogDescription>
            Update your {row.label.toLowerCase()} and save the changes.
          </DialogDescription>
        </DialogHeader>
        {row.type === "gender" ? (
          <Select
            value={value || "unknown"}
            onValueChange={(val) => setValue(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={row.type === "email" ? "email" : "text"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={
              row.type === "url"
                ? "https://example.com"
                : row.type === "email"
                ? "user@example.com"
                : `Enter ${row.label.toLowerCase()}`
            }
          />
        )}
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            disabled={isSaving}
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StaticProfileRow = ({
  label,
  value,
  themeClasses,
}: {
  label: string;
  value: string;
  themeClasses: ThemeClassTokens;
}) => (
  <div className="flex items-center justify-between px-4 py-4">
    <span className={cn("text-sm", themeClasses.text.primary)}>{label}</span>
    <span className={cn("text-sm", themeClasses.text.muted)}>
      {value.length ? value : "Not Set"}
    </span>
  </div>
);

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "unknown", label: "Unknown" },
];

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

function maskUid(uid: string) {
  if (uid.length <= 6) return uid;
  const prefix = uid.slice(0, 2);
  const suffix = uid.slice(-3);
  return `${prefix}${"*".repeat(Math.max(uid.length - 5, 3))}${suffix}`;
}

function formatGender(gender: string | null | undefined) {
  const option = genderOptions.find((item) => item.value === gender);
  return option ? option.label : "Unknown";
}

export default ProfileScreenClient;

