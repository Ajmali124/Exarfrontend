"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LogoutButton({
  variant = "default",
  fullWidth = false,
  className,
}: {
  variant?: "default" | "danger";
  fullWidth?: boolean;
  className?: string;
} = {}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant === "danger" ? "destructive" : "outline"}
      className={cn(fullWidth && "w-full", className)}
    >
      Logout
    </Button>
  );
}
