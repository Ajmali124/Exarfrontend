"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";

interface RegisterCardProps {
  children: React.ReactNode;
}

export function RegisterCard({ children }: RegisterCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card className={`bg-transparent backdrop-blur-md ${
      isDark ? "border-white/5" : "border-gray-200/50"
    }`}>
      <CardHeader className="text-center">
        <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
          Connect Your Crypto World
        </CardTitle>
        <CardDescription className={isDark ? "text-white/70" : "text-gray-600"}>
          Enter your details to join our crypto trading platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

