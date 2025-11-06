import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import prisma from "./prismadb";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Require email verification to login
  },
  plugins: [
    emailOTP({
      allowedAttempts: 5,
      overrideDefaultEmailVerification: true, // Use OTP instead of link verification
      otpLength: 4, // Generate 4-digit OTP codes
      expiresIn: 300, // OTP expires in 5 minutes (300 seconds)
      sendVerificationOnSignUp: true, // Send OTP on signup
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
