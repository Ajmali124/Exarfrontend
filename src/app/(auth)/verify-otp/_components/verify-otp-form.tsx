"use client";

import { useEffect, useState } from "react";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import { AuthBrandingSection } from "@/app/(auth)/_components/auth-branding-section";

const otpSchema = z.object({
  otp: z.string().min(4, "Please enter the complete 4-digit code"),
});

export function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const fromLogin = searchParams.get("from") === "login";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });
  const [otpSent, setOtpSent] = useState(false);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const showError = (title: string, message: string) => {
    setErrorDialog({ open: true, title, message });
  };

  // Automatically send OTP when coming from login
  useEffect(() => {
    const sendOtpOnLogin = async () => {
      if (fromLogin && email && !otpSent) {
        try {
          await authClient.emailOtp.sendVerificationOtp({
            email: email,
            type: "email-verification",
          });
          setOtpSent(true);
          toast.success("Verification code sent to your email");
        } catch (error: any) {
          console.error("Failed to send OTP:", error);
          // Don't show error dialog here, let user try resend
        }
      }
    };

    sendOtpOnLogin();
  }, [fromLogin, email, otpSent]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPassword = sessionStorage.getItem("pendingSignupPassword");
    setPendingPassword(storedPassword);
  }, []);

  const clearPendingCredentials = () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("pendingSignupEmail");
    sessionStorage.removeItem("pendingSignupPassword");
  };

  const onSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      if (!email) {
        showError("Error", "Email not found. Please go back to registration.");
        return;
      }

      await authClient.emailOtp.verifyEmail({
        email: email,
        otp: values.otp,
      });

      if (pendingPassword) {
        try {
          await authClient.signIn.email({
            email,
            password: pendingPassword,
          });
          clearPendingCredentials();
          toast.success("Email verified and you are now signed in!");
          router.push("/dashboard");
          return;
        } catch (signinError: any) {
          console.error("Auto sign-in after verification failed:", signinError);
          toast.info("Email verified! Please sign in to continue.");
        }
      } else {
        toast.success("Email verified! Please sign in to continue.");
      }

      clearPendingCredentials();
      router.push(`/login?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      const errorMessage = error.message || "Invalid verification code. Please check the code and try again.";
      showError("Verification Failed", errorMessage);
    }
  };

  const resendOTP = async () => {
    try {
      if (!email) {
        showError("Error", "Email not found. Please go back to registration.");
        return;
      }

      await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "email-verification",
      });

      setOtpSent(true);
      toast.success("Verification code sent to your email");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to resend verification code. Please try again later.";
      showError("Resend Failed", errorMessage);
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Desktop: Split Layout | Mobile: Centered Form */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding & Features (Desktop Only) */}
        <AuthBrandingSection />

        {/* Right Side - Verify OTP Form */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <Card className={`bg-transparent backdrop-blur-md ${
            isDark ? "border-white/5" : "border-gray-200/50"
          }`}>
          <CardHeader className="text-center">
            <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
              Verify Your Email
            </CardTitle>
            <CardDescription className={isDark ? "text-white/70" : "text-gray-600"}>
              We've sent a 4-digit verification code to{" "}
              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                {email || "your email"}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormLabel className={isDark ? "text-white" : "text-gray-900"}>
                        Enter verification code
                      </FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={4}
                          {...field}
                          disabled={isPending}
                          className={isDark ? "" : "[&>div>div]:border-gray-300 [&>div>div]:bg-gray-50/80 [&>div>div]:text-gray-900"}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                        </InputOTP>
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
                  {isPending ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center space-y-2">
                  <p className={`text-sm ${
                    isDark ? "text-white/70" : "text-gray-600"
                  }`}>
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={resendOTP}
                    disabled={isPending}
                    className={`text-sm ${
                      isDark ? "text-white hover:text-white/80" : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    Resend verification code
                  </Button>
                </div>

                <div className={`text-center text-sm ${
                  isDark ? "text-white/70" : "text-gray-600"
                }`}>
                  Wrong email?{" "}
                  <Link
                    href="/register"
                    className={`hover:underline font-medium ${
                      isDark ? "text-white" : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    Go back to registration
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Error Dialog */}
      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <DialogContent className={isDark ? "bg-gray-900 border-white/10 text-white" : ""}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : ""}>{errorDialog.title}</DialogTitle>
            <DialogDescription className={isDark ? "text-white/70" : ""}>
              {errorDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setErrorDialog({ ...errorDialog, open: false })}
              className={
                isDark
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
