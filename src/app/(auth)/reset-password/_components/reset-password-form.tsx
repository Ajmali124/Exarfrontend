"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import { AuthBrandingSection } from "@/app/(auth)/_components/auth-branding-section";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      if (!email || !otp) {
        toast.error("Missing email or verification code");
        return;
      }

      await authClient.emailOtp.resetPassword({
        email: email,
        otp: otp,
        password: values.password,
      });

      toast.success("Password reset successfully! Please sign in with your new password");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Desktop: Split Layout | Mobile: Centered Form */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding & Features (Desktop Only) */}
        <AuthBrandingSection />

        {/* Right Side - Reset Password Form */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <Card className={`bg-transparent backdrop-blur-md ${
            isDark ? "border-white/5" : "border-gray-200/50"
          }`}>
          <CardHeader className="text-center">
            <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
              Set New Password
            </CardTitle>
            <CardDescription className={isDark ? "text-white/70" : "text-gray-600"}>
              Create a new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDark ? "text-white" : "text-gray-900"}>
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your new password"
                          type="password"
                          {...field}
                          disabled={isPending}
                          className={
                            isDark
                              ? "bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                              : "bg-gray-50/80 border-gray-300/50 text-gray-900 placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20"
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={isDark ? "text-white" : "text-gray-900"}>
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm your new password"
                          type="password"
                          {...field}
                          disabled={isPending}
                          className={
                            isDark
                              ? "bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                              : "bg-gray-50/80 border-gray-300/50 text-gray-900 placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20"
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className={`w-full ${
                    isDark
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                  }`}
                  disabled={isPending}
                >
                  {isPending ? "Resetting password..." : "Reset Password"}
                </Button>

                <div className={`text-center text-sm ${
                  isDark ? "text-white/70" : "text-gray-600"
                }`}>
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className={`hover:underline font-medium ${
                      isDark ? "text-white" : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
