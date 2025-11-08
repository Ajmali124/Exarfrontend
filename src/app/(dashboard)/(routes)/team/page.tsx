import { requireAuth } from "@/lib/auth-utils";
import { dashboardTheme } from "@/lib/theme-utils";
import TeamPageContent from "./_components/TeamPageContent";
import TeamImage from "./_components/teamimage";
import { Suspense } from "react";
import Loading from "../../loading";

const TeamPage = async () => {
  await requireAuth();

  return (
    <div className={`min-h-screen ${dashboardTheme.content.default}`}>
      <Suspense fallback={<Loading />}>
        <div className="mt-10 flex flex-col gap-10 px-0 md:px-6">
          <TeamImage />
          <TeamPageContent />
        </div>
      </Suspense>
    </div>
  );
};

export default TeamPage;
