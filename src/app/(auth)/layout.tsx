import React from "react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import Header from "@/app/(landing)/components/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black">
      <AnimatedBackground />
      
      {/* Header/Navbar */}
      <Header />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

