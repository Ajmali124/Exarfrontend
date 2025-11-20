import { requireAuth } from "@/lib/auth-utils";
import { dashboardTheme } from "@/lib/theme-utils";
import PromotionHero from "./_components/PromotionHero";

const PromotionPage = async () => {
  await requireAuth();

  return (
    <div className={`min-h-screen ${dashboardTheme.content.default}`}>
      <div className="mt-14 px-4 md:px-6 py-6 space-y-6">
        {/* Hero Section */}
        <PromotionHero />

        {/* Additional content sections will be added here */}
      </div>
    </div>
  );
};

export default PromotionPage;