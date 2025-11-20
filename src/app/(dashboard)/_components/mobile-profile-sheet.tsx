"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/trpc/client";
import {
  ChevronRight,
  ClipboardCopy,
  Gift,
  Headset,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  ShieldHalf,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { LogoutButton } from "@/app/(dashboard)/(routes)/dashboard/_components/logout-button";

interface MobileProfileSheetProps {
  children: React.ReactNode;
}

const quickActions = [
  { label: "Refer", icon: UserPlus, href: "/invite" },
  { label: "Vouchers", icon: Gift, href: "/voucher" },
  { label: "Events", icon: Sparkles, href: undefined },
] as const;

type QuickAction = {
  label: string;
  icon: typeof UserPlus | typeof Gift | typeof Sparkles;
  href?: string;
};

const settingsItems = [
  { label: "Verification", value: "Verified" as string | undefined, icon: ShieldCheck },
  { label: "Security Center", value: "Moderate" as string | undefined, icon: ShieldHalf },
  { label: "Preferences", value: undefined, icon: Sparkles },
] as const;

type SettingsItem = (typeof settingsItems)[number];

const otherItems = [
  { label: "Satisfaction Survey", value: "Submitted" as string | undefined, icon: MessageSquare },
  { label: "Contact Support", value: undefined, icon: Headset },
  { label: "Help Center", value: undefined, icon: HelpCircle },
  { label: "Feedback", value: undefined, icon: MessageSquare },
] as const;

type OtherItem = (typeof otherItems)[number];

const ensureString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return undefined;
};

const resolveDisplayName = (
  raw: unknown,
  fallback: string = "User"
): string => {
  return ensureString(raw) ?? fallback;
};

const resolveProfileImage = (image: unknown): string | undefined =>
  ensureString(image);

const MobileProfileSheet = ({ children }: MobileProfileSheetProps) => {
  const [open, setOpen] = useState(false);
  const { data: basicInfo } = trpc.user.getBasicInfo.useQuery(undefined, {
    enabled: open,
  });
  const { data: vouchers } = trpc.user.getVouchers.useQuery(undefined, {
    enabled: open,
  });
  
  const maskedUid = useMemo(() => {
    const id = ensureString(basicInfo?.id);
    if (!id) return "******";
    if (id.length <= 6) return id;
    return `${id.slice(0, 3)}***${id.slice(-3)}`;
  }, [basicInfo?.id]);

  const displayName = resolveDisplayName(
    basicInfo?.name ??
      basicInfo?.username ??
      basicInfo?.email,
    "User"
  );
  const profileImage = resolveProfileImage(basicInfo?.image);

  // Count unused vouchers
  const unusedVoucherCount = useMemo(() => {
    if (!vouchers) return undefined;
    const unused = vouchers.filter(
      (v) => v.status === "active" && new Date(v.expiresAt) > new Date()
    );
    return unused.length > 0 ? unused.length.toString() : undefined;
  }, [vouchers]);

  const copyUid = () => {
    if (typeof basicInfo?.id !== "string") return;
    void navigator.clipboard?.writeText(basicInfo.id);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="left"
        className="w-[85vw] max-w-xs border-r p-0 mt-12"
      >
        <SheetTitle className="sr-only">Profile menu</SheetTitle>
        <div className="flex h-full flex-col bg-background">
          <div className="flex-1 overflow-y-auto pb-8">
            <div className="space-y-3 border-b border-border px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-base font-semibold">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                </div>
                <div className="flex-1 text-[12px]">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {displayName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                    UID: <span className="font-mono">{maskedUid}</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyUid}
                    className="mt-2 h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <ClipboardCopy className="mr-1 inline h-3 w-3" />
                    Copy UID
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 px-5 py-4 text-center text-xs">
              {quickActions.map((item) => (
                <QuickActionTile 
                  key={item.label} 
                  action={item} 
                  badge={item.label === "Vouchers" ? unusedVoucherCount : undefined}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-5 px-5 pb-5">
              <Section title="Settings">
                {settingsItems.map((item) => (
                  <ProfileRow key={item.label} item={item} />
                ))}
              </Section>

              <Section title="Others">
                {otherItems.map((item) => (
                  <ProfileRow key={item.label} item={item} />
                ))}
              </Section>
            </div>
          </div>

          <div className="sticky bottom-16 border-t border-border bg-background px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <LogoutButton
              variant="danger"
              fullWidth
              className="h-10 rounded-md text-sm font-medium"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </p>
    <div className="space-y-1 rounded-xl border border-border bg-background/50 p-1">
      {children}
    </div>
  </div>
);

const QuickActionTile = ({ 
  action, 
  badge, 
  onClose 
}: { 
  action: QuickAction; 
  badge?: string | undefined;
  onClose?: () => void;
}) => {
  const Icon = action.icon;
  const router = useRouter();
  
  const handleClick = () => {
    if (action.href) {
      onClose?.();
      router.push(action.href);
    }
  };

  const content = (
    <div className="relative flex flex-col items-center justify-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span>{action.label}</span>
      {badge ? (
        <span className="absolute -right-1.5 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] text-white">
          {badge}
        </span>
      ) : null}
    </div>
  );

  if (action.href) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full"
      >
        {content}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="w-full"
    >
      {content}
    </button>
  );
};

const ProfileRow = ({
  item,
}: {
  item: SettingsItem | OtherItem;
}) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-1 flex-col text-[13px]">
        <span className="font-medium text-foreground leading-tight">{item.label}</span>
        {item.value ? (
          <span className="text-[11px] text-muted-foreground leading-tight">
            {item.value}
          </span>
        ) : null}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
};

export default MobileProfileSheet;

