import { requireAuth } from "@/lib/auth-utils";
import { dashboardTheme } from "@/lib/theme-utils";
import KycPageContent from "./_components/kyc-page-content";

const KycPage = async () => {
  await requireAuth();

  return (
    <div className={`min-h-screen ${dashboardTheme.content.default}`}>
      <div className=" px-4 md:px-1 py-2 space-y-2">
        <KycPageContent />
      </div>
    </div>
  );
};

export default KycPage;

