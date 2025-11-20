import PublicPromotionHero from "./_component/PublicPromotionHero";
import PublicPromotionRules from "./_component/PublicPromotionRules";

const PublicPromotionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 md:px-6 py-12 space-y-12">
        {/* Hero Section */}
        <PublicPromotionHero />

        {/* Rules Section */}
        <PublicPromotionRules />
      </div>
    </div>
  );
};

export default PublicPromotionPage;

