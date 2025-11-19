"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useThemeClasses } from "@/lib/theme-utils";
import {
  SquareStack,
  Users,
  UserPlus,
  Trophy,
  TrendingUp,
  User,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";

const navItems = [
  {
    label: "Subscribe",
    icon: SquareStack,
    href: "/stake",
    type: "link" as const,
  },
  {
    label: "Team",
    icon: Users,
    href: "/team",
    type: "link" as const,
  },
  {
    label: "Rank",
    icon: Trophy,
    href: "/rank",
    type: "link" as const,
  },
  {
    label: "Invite",
    icon: UserPlus,
    href: "/invite",
    type: "link" as const,
  },
  {
    label: "Wealth",
    icon: TrendingUp,
    href: "/wealth",
    type: "link" as const,
  },
  {
    label: "AI Master",
    icon: Sparkles,
    href: "/ai-master",
    type: "link" as const,
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
    type: "link" as const,
  },
  {
    label: "More",
    icon: MoreHorizontal,
    href: "/more",
    type: "link" as const,
  },
];

const comingSoonItems = new Set(["Rank", "Wealth", "AI Master", "More"]);

const MainNav = () => {
  const { text, border } = useThemeClasses();

  const NavItem = ({
    item,
    index,
  }: {
    item: (typeof navItems)[0];
    index: number;
  }) => {
    const Icon = item.icon;
    const isComingSoon = comingSoonItems.has(item.label);

    const hoverProps = isComingSoon
      ? {}
      : {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
        };

    const content = (
      <motion.div
        {...hoverProps}
        className={`group flex flex-col items-center justify-center gap-1.5 ${
          isComingSoon ? "cursor-not-allowed opacity-70" : "cursor-pointer"
        }`}
      >
        <div
          className={`
            p-3 rounded-lg
            border-[0.5px]
            ${border.primary}
            transition-all duration-200
            ${
              isComingSoon
                ? "bg-muted/40 border-dashed"
                : "group-hover:border-green-500 dark:group-hover:border-purple-500 group-hover:bg-green-50/50 dark:group-hover:bg-purple-500/10"
            }
            flex items-center justify-center
            backdrop-blur-sm
          `}
        >
          <Icon
            className={`
              h-5 w-5
              ${isComingSoon ? "text-muted-foreground" : text.secondary}
              transition-colors duration-200
              ${
                isComingSoon
                  ? ""
                  : "group-hover:text-green-600 dark:group-hover:text-purple-400"
              }
            `}
          />
        </div>
        <p
          className={`
            text-xs font-medium
            ${text.secondary}
            transition-colors duration-200
            text-center
            ${
              isComingSoon
                ? "text-muted-foreground"
                : "group-hover:text-green-600 dark:group-hover:text-purple-400"
            }
          `}
        >
          {item.label}
        </p>
        {/* {isComingSoon && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Coming soon
          </span>
        )} */}
      </motion.div>
    );

    if (isComingSoon) {
      return (
        <div key={item.label} className="w-full" title="Coming soon">
          {content}
        </div>
      );
    }

    return (
      <Link key={item.label} href={item.href} prefetch className="w-full">
        {content}
      </Link>
    );
  };

  return (
    <div className="w-full p-0 md:p-6 mb-2">
      <div className="w-full">
        {/* Two rows grid */}
        <div className="grid grid-cols-4 gap-2 md:gap-3 w-full">
          {navItems.map((item, index) => (
            <NavItem key={item.label} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainNav;
