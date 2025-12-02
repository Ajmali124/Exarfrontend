"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import { AuthBrandingSection } from "@/app/(auth)/_components/auth-branding-section";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldUseDarkTheme = mounted && theme === "dark";
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    form.clearErrors();

    try {
      await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage = (error?.message || "").toLowerCase();
      const statusCode = error?.status || error?.statusCode || error?.code;

      // Wrong password or invalid credentials
      if (
        statusCode === 401 ||
        errorMessage.includes("password") ||
        errorMessage.includes("incorrect") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("wrong") ||
        errorMessage.includes("credentials")
      ) {
        toast.error("Incorrect email or password. Please try again.");
        form.setError("password", {
          type: "manual",
          message: "Incorrect password",
        });
        return;
      }

      // User not found
      if (
        statusCode === 404 ||
        errorMessage.includes("not found") ||
        errorMessage.includes("does not exist") ||
        errorMessage.includes("no user") ||
        errorMessage.includes("user not found")
      ) {
        toast.error("No account found with this email address");
        form.setError("email", {
          type: "manual",
          message: "No account found with this email",
        });
        return;
      }

      toast.error(error?.message || "Failed to sign in. Please try again.");
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Desktop: Split Layout | Mobile: Centered Form */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding & Features (Desktop Only) */}
        <AuthBrandingSection />

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <Card className={`bg-transparent backdrop-blur-md ${
            shouldUseDarkTheme ? "border-white/5" : "border-gray-200/50"
          }`}>
          <CardHeader className="text-center">
            <CardTitle className={shouldUseDarkTheme ? "text-white" : "text-gray-900"}>
              Welcome back
            </CardTitle>
            <CardDescription className={shouldUseDarkTheme ? "text-white/70" : "text-gray-600"}>
              Enter your email and password to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={shouldUseDarkTheme ? "text-white" : "text-gray-900"}>
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            type="email"
                            {...field}
                            disabled={isPending}
                            className={
                              shouldUseDarkTheme
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
                        <FormLabel className={shouldUseDarkTheme ? "text-white" : "text-gray-900"}>
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                          <Input
                            placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                            {...field}
                            disabled={isPending}
                              className={cn(
                                shouldUseDarkTheme
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
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className={`text-sm transition-colors ${
                      shouldUseDarkTheme
                        ? "text-white/70 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className={`w-full ${
                    shouldUseDarkTheme
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                  }`}
                  disabled={isPending}
                >
                  {isPending ? "Signing in..." : "Sign in"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span
                      className={`px-2 ${
                        shouldUseDarkTheme
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
                      shouldUseDarkTheme
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
                      shouldUseDarkTheme
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
                  shouldUseDarkTheme ? "text-white/70" : "text-gray-600"
                }`}>
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className={`hover:underline font-medium ${
                      shouldUseDarkTheme ? "text-white" : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    Sign up
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