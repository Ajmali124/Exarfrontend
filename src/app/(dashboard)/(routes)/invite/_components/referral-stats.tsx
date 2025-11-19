import Link from "next/link";
import React from "react";
import { ArrowRight } from "lucide-react";


import { useThemeClasses } from "@/lib/theme-utils";

interface ReferralStatsProps {
  thirtyDayCommission: number;
  todayReferrals: number;
  thirtyDayReferrals: number;
}

const ReferralStats: React.FC<ReferralStatsProps> = ({
  thirtyDayCommission,
  todayReferrals,
  thirtyDayReferrals,
}) => {
  const { card, text } = useThemeClasses();

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`${text.primary} text-md font-semibold`}>Referrals</h2>
        <Link
          href="/team"
          className={`text-xs font-semibold flex items-center gap-1 ${text.secondary} transition hover:opacity-80`}
        >
          <ArrowRight className="h-4 w-4 text-green-500 dark:text-purple-400" />
        </Link>
      </div>

      <div className={`rounded-sm border px-2 py-2 flex flex-col gap-3 ${card}`}>
        <div className="flex items-center justify-between">
          <p className={`${text.secondary} text-sm`}>30D Commission</p>
        </div>
        <p className={`${text.primary} text-xl font-bold leading-tight`}>
          {currencyFormatter.format(thirtyDayCommission)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Today's referrals",
            value: todayReferrals,
          },
          {
            label: "30D referrals",
            value: thirtyDayReferrals,
          },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-sm border px-3 py-4 ${card}`}>
            <p className={`${text.secondary} text-xs uppercase tracking-wide`}>{stat.label}</p>
            <p className={`${text.primary} text-xl font-semibold mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReferralStats;

