"use client";

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useThemeClasses } from '@/lib/theme-utils';

export function LogoutButton() {
  const router = useRouter();
  const { buttonSecondary } = useThemeClasses();

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
    <Button onClick={handleLogout} variant="outline" className={buttonSecondary}>
      Logout
    </Button>
  );
}
