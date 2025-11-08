"use client";

import { useEffect, useState } from "react";
import { useThemeClasses } from "@/lib/theme-utils";
import { trpc } from "@/trpc/client";
import TeamLevelAccordion from "./TeamLevelAccordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { animate, motion, useMotionValue } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

const useAnimatedNumber = (targetValue: number, enabled: boolean) => {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const safeTarget = Number.isFinite(targetValue) ? targetValue : 0;

    if (!enabled) {
      motionValue.set(safeTarget);
      setDisplayValue(Math.round(safeTarget));
      return;
    }

    const controls = animate(motionValue, safeTarget, {
      duration: 0.6,
      ease: "easeOut"
    });

    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [targetValue, enabled, motionValue]);

  return displayValue;
};

const TeamPageContent = () => {
  const { text, bg, border } = useThemeClasses();

  const { data: stats, isLoading: statsLoading } =
    trpc.user.getTeamStats.useQuery();

  const totalMembers =
    stats?.reduce((acc, stat) => acc + stat.count, 0) || 0;
  const activeLevelsCount = stats?.filter((s) => s.count > 0).length || 0;
  const directReferrals = stats?.[0]?.count || 0;

  const StatOrbCard = ({
    title,
    value,
    loading,
    delay = 0,
    suffix
  }: {
    title: string;
    value: number;
    loading: boolean;
    delay?: number;
    suffix?: string;
  }) => {
    const animatedValue = useAnimatedNumber(value, !loading);
    const displayValue = Number.isFinite(animatedValue)
      ? animatedValue.toLocaleString()
      : "0";

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay, duration: 0.45, ease: "easeOut" }}
        whileHover={{ y: -4 }}
        className="relative"
      >
        <Card
          className={`
            ${bg.card} ${border.primary} border
            overflow-hidden p-2 sm:p-5
          `}
        >
          <div className="relative flex flex-col items-center gap-4">
            <motion.div
              aria-hidden
              className="absolute inset-x-2 top-2 h-24 rounded-full bg-gradient-to-r from-purple-500/10 via-transparent to-emerald-500/10 blur-xl"
              animate={{ opacity: [0.35, 0.65, 0.35] }}
              transition={{ repeat: Infinity, duration: 6 }}
            />

            <div className="relative flex items-center justify-center">
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-full border border-purple-500/40 dark:border-purple-400/40"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              />
              <motion.div
                className="pointer-events-none absolute inset-1 rounded-full border border-emerald-500/40 dark:border-emerald-300/40"
                style={{
                  maskImage:
                    "radial-gradient(circle at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)"
                }}
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
              />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-background to-background/80 shadow-inner sm:h-28 sm:w-28">
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-1 rounded-full bg-gradient-to-br from-background via-background/60 to-background/10 backdrop-blur-sm"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay }}
                />

                {loading ? (
                  <div className="relative z-10">
                    <Skeleton className="h-10 w-16" />
                  </div>
                ) : (
                  <motion.span
                    key={displayValue}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`relative z-10 text-2xl font-semibold sm:text-3xl ${text.primary}`}
                  >
                    {displayValue}
                    {suffix ? (
                      <span className="text-base font-medium text-muted-foreground">
                        {suffix}
                      </span>
                    ) : null}
                  </motion.span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p
                className={`text-xs uppercase tracking-[0.18em] text-muted-foreground`}
              >
                {title}
              </p>
              {!loading && (
                <motion.div
                  className="flex items-center gap-1 text-[10px] text-emerald-500/70 dark:text-purple-300/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.2, duration: 0.4 }}
                >
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px] shadow-emerald-400/60 dark:bg-purple-400 dark:shadow-purple-400/60" />
                  Synced
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-6 -mt-8">
      {/* Stats Cards */}
      <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <StatOrbCard
            title="Total Team"
            value={totalMembers}
            loading={statsLoading}
          />

          <StatOrbCard
            title="Direct Signups"
            value={directReferrals}
            loading={statsLoading}
            delay={0.06}
          />
        </div>

        {/* <StatOrbCard
          title="Open Levels"
          value={activeLevelsCount}
          suffix="/10"
          loading={statsLoading}
          delay={0.12}
        /> */}
      </div>

      {/* Team Levels Accordions */}
      <div className="space-y-2">
        <h2 className={`text-lg font-semibold ${text.primary} mb-4`}>
          
        </h2>
        <div className="space-y-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
            <TeamLevelAccordion key={level} level={level} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPageContent;

