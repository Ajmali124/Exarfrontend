"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { handlePostRegistration, getUserByEmail } from "@/action/Auth/register";
import { useTheme } from "@/context/ThemeContext";
import { AuthBrandingSection } from "@/app/(auth)/_components/auth-branding-section";
import { RegisterCard } from "@/app/(auth)/_components/register-card";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showInviteCode, setShowInviteCode] = useState(false);
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      inviteCode: "",
      termsAccepted: true, // Always checked by default
    },
  });


  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      // Step 1: Create user account with better-auth
      await authClient.signUp.email({
        name: values.email,
        email: values.email,
        password: values.password,
        callbackURL: "/verify-otp",
      });

      // Step 2: Get the user ID and name from the database
      // Query by email since better-auth creates the user immediately
      const user = await getUserByEmail(values.email);
      const userId = user?.id;

      if (!userId) {
        throw new Error("Failed to retrieve user ID after registration");
      }

      // Step 3: Handle post-registration logic
      // - Generate invite code for the new user
      // - Generate username for the new user
      // - Create user balance
      // - Create InvitedMember record if invite code was provided
      const postRegResult = await handlePostRegistration({
        userId,
        userEmail: values.email,
        userName: user?.name || values.email, // Use name from better-auth if available, fallback to email
        inviteCode: values.inviteCode?.trim() || undefined,
      });

      if (!postRegResult.success) {
        // Show error but don't block the flow
        toast.error(postRegResult.error || "Failed to complete registration setup");
      }
      
      toast.success("Account created! Please check your email for verification code.");
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
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
                          <Input
                            placeholder="Create a strong password"
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
