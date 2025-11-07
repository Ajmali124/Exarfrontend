"use client";
import { cn } from "@/lib/utils";
import {
  Gift,
  LayoutDashboard,
  SquareStackIcon,
  StarIcon,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    label: "Home",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Market",
    icon: Wallet,
    href: "/market",
  },
  {
    label: "Arbify",
    icon: StarIcon,
    href: "/arbify",
  },
  {
    label: "Subscribe",
    icon: Gift,
    href: "/stake",
  },
  {
    label: "Wallet",
    icon: SquareStackIcon,
    href: "/wallet",
  },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-2 py-1">
      <div className="grid grid-cols-5 gap-1 mx-auto text-xs">
        {routes.map((route) => {
          const isActive = pathname === route.href;

          return (
            <Link key={route.href} href={route.href}>
              <div
                className={cn(
                  "flex flex-col items-center justify-center p-1.5 rounded-md transition-colors duration-200",
                  isActive 
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <route.icon className="h-4 w-4 mb-0.5" />
                <span className="text-[10px] font-medium leading-tight">{route.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
