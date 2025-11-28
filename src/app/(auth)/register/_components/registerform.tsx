"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Eye, EyeOff, Info } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { handlePostRegistration, getUserByEmail } from "@/action/Auth/register";
import { useTheme } from "@/context/ThemeContext";
import { AuthBrandingSection } from "@/app/(auth)/_components/auth-branding-section";
import { RegisterCard } from "@/app/(auth)/_components/register-card";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  inviteCode: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<
    null | { tone: "success" | "error"; title: string; description: string }
  >(null);
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      inviteCode: "",
      termsAccepted: true, // Always checked by default
    },
  });

  const inviteCodeValue = form.watch("inviteCode");

  useEffect(() => {
    const paramCode = searchParams?.get("inviteCode");
    const storedCode =
      typeof window !== "undefined" ? window.localStorage.getItem("referralCode") : null;
    const currentValue = form.getValues("inviteCode");

    if (paramCode && paramCode !== currentValue) {
      form.setValue("inviteCode", paramCode);
      setShowInviteCode(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("referralCode", paramCode);
      }
      return;
    }

    if (!paramCode && storedCode && storedCode !== currentValue) {
      form.setValue("inviteCode", storedCode);
      setShowInviteCode(true);
    }
  }, [searchParams, form]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (inviteCodeValue) {
      window.localStorage.setItem("referralCode", inviteCodeValue);
    } else {
      window.localStorage.removeItem("referralCode");
    }
  }, [inviteCodeValue]);

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setStatus(null);
    try {
      const existingUser = await getUserByEmail(values.email);
      if (existingUser) {
        form.setError("email", {
          type: "manual",
          message: "An account with this email already exists",
        });
        setStatus({
          tone: "error",
          title: "Email already registered",
          description: "Redirecting you to the login page so you can sign in.",
        });
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(values.email)}`);
        }, 1500);
        return;
      }

      await authClient.signUp.email({
        name: values.email,
        email: values.email,
        password: values.password,
      });

      const user = await getUserByEmail(values.email);
      const userId = user?.id;

      if (!userId) {
        throw new Error("Failed to retrieve user ID after registration");
      }

      const postRegResult = await handlePostRegistration({
        userId,
        userEmail: values.email,
        userName: user?.name || values.email,
        inviteCode: values.inviteCode?.trim() || undefined,
      });

      if (!postRegResult.success) {
        setStatus({
          tone: "error",
          title: "Setup issue",
          description: postRegResult.error || "Failed to complete registration setup. You can continue, but some bonus features may be delayed.",
        });
      }

      setStatus({
        tone: "success",
        title: "Account created",
        description: "Signing you in now…",
      });

      try {
        await authClient.signIn.email({
          email: values.email,
          password: values.password,
        });
        setStatus({
          tone: "success",
          title: "Welcome to Exarpro",
          description: "Redirecting you to your dashboard.",
        });
        router.push("/dashboard");
      } catch (loginError: any) {
        console.error("Auto sign-in after registration failed:", loginError);
        setStatus({
          tone: "error",
          title: "Auto sign-in failed",
          description: "Your account is ready. Please sign in to continue.",
        });
        router.push("/login");
      }
    } catch (error: any) {
      const message = error?.message || "Failed to create account";
      setStatus({
        tone: "error",
        title: "Unable to create account",
        description: message,
      });

      if (message.toLowerCase().includes("password")) {
        form.setError("password", {
          type: "manual",
          message: "Please choose a different password",
        });
      }
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Desktop: Split Layout | Mobile: Centered Form */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding & Features (Desktop Only) */}
        <AuthBrandingSection />

        {/* Right Side - Registration Form */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <RegisterCard>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {status && (
                  <Alert
                    variant={status.tone === "error" ? "destructive" : "default"}
                    className={cn(
                      "border border-border/60",
                      status.tone === "error"
                        ? "bg-red-50/90 text-red-900 dark:bg-red-500/10 dark:text-red-100"
                        : "bg-emerald-50/80 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100"
                    )}
                  >
                    <Info className="mt-1 text-current" />
                    <AlertTitle>{status.title}</AlertTitle>
                    <AlertDescription>{status.description}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDark ? "text-white" : "text-gray-900"}>
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            type="email"
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDark ? "text-white" : "text-gray-900"}>
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Create a strong password"
                              type={showPassword ? "text" : "password"}
                              {...field}
                              disabled={isPending}
                              className={cn(
                                isDark
                                  ? "bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                                  : "bg-gray-50/80 border-gray-300/50 text-gray-900 placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20",
                                "pr-12"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-900 dark:text-white/60 dark:hover:text-white"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Collapsible Invite Code Field */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteCode(!showInviteCode)}
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-white/70 hover:text-white" : "text-gray-600 hover:text-gray-900"
                      } transition-colors`}
                    >
                      {showInviteCode ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span>Invite Code (Optional)</span>
                    </button>
                    
                    {showInviteCode && (
                      <FormField
                        control={form.control}
                        name="inviteCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Enter your invite code (optional)"
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
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className={`mt-1 flex-shrink-0 ${
                              isDark
                                ? "border-white/20 data-[state=checked]:bg-white data-[state=checked]:border-white"
                                : "border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            }`}
                          />
                        </FormControl>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className={`text-xs sm:text-sm leading-normal font-light sm:font-normal ${
                            isDark ? "text-white/60 sm:text-white/70" : "text-gray-500 sm:text-gray-600"
                          }`}>
                            <span>By signing up, you confirm that you are over 18 years of age and that you have read our </span>
                            <Link
                              href="/terms"
                              className={`inline font-semibold sm:font-bold hover:underline ${
                                isDark ? "text-white/90 sm:text-white" : "text-green-600 hover:text-green-700"
                              }`}
                            >
                              Terms and Conditions
                            </Link>
                            <span> outlined.</span>
                          </div>
                          <p className={`text-[10px] sm:text-xs ${
                            isDark ? "text-white/50 sm:text-white/60" : "text-gray-400 sm:text-gray-500"
                          }`}>
                            Please note: Users from the UAE, USA, and UK are not permitted to register.
                          </p>
                        </div>
                      </div>
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
                  {isPending ? "Creating account..." : "Create account"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span
                      className={`px-2 ${
                        isDark
                          ? "bg-black text-white/50"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className={
                      isDark
                        ? "w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                        : "w-full bg-gray-100/80 border-gray-300/50 text-gray-900 hover:bg-gray-200/80 hover:border-gray-400/50"
                    }
                    type="button"
                    disabled={isPending}
                  >
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline"
                    className={
                      isDark
                        ? "w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                        : "w-full bg-gray-100/80 border-gray-300/50 text-gray-900 hover:bg-gray-200/80 hover:border-gray-400/50"
                    }
                    type="button"
                    disabled={isPending}
                  >
                    Continue with Facebook
                  </Button>
                </div>

                <div className={`text-center text-sm ${
                  isDark ? "text-white/70" : "text-gray-600"
                }`}>
                  Already have an account?{" "}
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
          </RegisterCard>
        </div>
      </div>
    </div>
  );
}
