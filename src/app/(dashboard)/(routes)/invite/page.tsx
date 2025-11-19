import ReferralHero from "./_components/referral-hero";
import CommissionCard from "./_components/commission-card";
import ReferralStats from "./_components/referral-stats";
import { useThemeClasses } from "@/lib/theme-utils";
import { caller } from "@/trpc/server";

const InvitePage = async () => {
  const { bg } = useThemeClasses();
  const basicInfo = (await caller.user.getBasicInfo()) as {
    inviteCode?: string | null;
  };

  const referralCode = basicInfo?.inviteCode ?? null;
  const referralLink = referralCode
    ? `https://www.exarpro.com/register?inviteCode=${referralCode}`
    : null;

  return (
    <div className={`min-h-screen px-4 pb-16 pt-16 sm:px-6 ${bg.primary}`}>
      <div className="mx-auto w-full max-w-xl space-y-6">
        <ReferralHero />
        <CommissionCard
          commissionRate={5}
          referralCode={referralCode}
          referralLink={referralLink}
        />
        <ReferralStats thirtyDayCommission={0} todayReferrals={0} thirtyDayReferrals={0} />
      </div>
    </div>
  );
};

export default InvitePage;