import { Suspense } from "react";

import { requireAuth } from "@/lib/auth-utils";
import { dashboardTheme } from "@/lib/theme-utils";

import StakePageContent from "./_components/StakePageContent";
import Loading from "../../loading";

const StakePage = async () => {
  await requireAuth();

  return (
    <div className={`min-h-screen ${dashboardTheme.content.default}`}>
      <Suspense fallback={<Loading />}>
        <div className="mt-14 px-0 md:px-6">
          <StakePageContent />
        </div>
      </Suspense>
    </div>
  );
};

export default StakePage;
