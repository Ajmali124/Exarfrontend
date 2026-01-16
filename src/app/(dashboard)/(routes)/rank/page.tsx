import { requireAuth } from "@/lib/auth-utils";
import { dashboardTheme } from "@/lib/theme-utils";
import RankPageContent from "./_components/rank-page-content";

const RankPage = async () => {
  await requireAuth();

  return (
    <div className={`min-h-screen ${dashboardTheme.content.default}`}>
      <div className="mt-14 px-4 md:px-6 py-6 space-y-6">
        <RankPageContent />
      </div>
    </div>
  );
};

export default RankPage;

