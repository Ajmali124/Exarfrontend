import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-utils";
import Loading from "../../../../loading";
import TeamEarningsContent from "./_components/TeamEarningsContent";

export const dynamic = "force-dynamic";

interface TeamEarningsPageProps {
  params: Promise<{ date: string }>;
}

const TeamEarningsPage = async ({ params }: TeamEarningsPageProps) => {
  await requireAuth();
  const { date } = await params;

  return (
    <div className="space-y-4">
      <Suspense fallback={<Loading />}>
        <div className="mt-16">
          <TeamEarningsContent date={date} />
        </div>
      </Suspense>
    </div>
  );
};

export default TeamEarningsPage;

