import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import prisma from "./prismadb";

// Get base URL from environment or default to production URL
const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.exarpro.com";

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Require email verification to login
  },
  trustedOrigins: [
    "https://www.exarpro.com",
    "http://localhost:3000",
    "http://localhost:8081", // Expo default
    "exp://localhost:8081", // Expo dev
    // Add your React Native app origins here if needed
  ],
  advanced: {
    cookiePrefix: "better-auth",
    // Allow cookies to work across subdomains if needed
    // sameSite: "lax", // Better Auth handles this automatically
  },
  plugins: [
    emailOTP({
      allowedAttempts: 5,
      overrideDefaultEmailVerification: true, // Use OTP instead of link verification
      otpLength: 4, // Generate 4-digit OTP codes
      expiresIn: 300, // OTP expires in 5 minutes (300 seconds)
      sendVerificationOnSignUp: false, // rely on overridden default to avoid duplicates
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await sendVerificationEmail(email, otp);
        } else if (type === "forget-password") {
          await sendPasswordResetEmail(email, otp);
        }
      },
    }),
  ],
  // Note: Post-registration is handled in register action for speed
});
