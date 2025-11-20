import { requireAuth } from "@/lib/auth-utils";
import { dashboardTheme } from "@/lib/theme-utils";
import Header from "./_component/HeroSection";
import PromotionRewards from "./_component/PromotionRewards";
import PromotionRules from "./_component/PromotionRules";

const PromotionPage = async () => {
  await requireAuth();

  return (
      <div className="mt-10 px-4 md:px-2 py-6 space-y-6">
        {/* Hero Section */}
        <Header />

        {/* Rewards Section */}
        <PromotionRewards />

        {/* Rules Section */}
        <PromotionRules />
      </div>
  );
};

export default PromotionPage;