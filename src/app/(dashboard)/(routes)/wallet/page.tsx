import { Suspense } from "react";
import Loading from "../../loading";
import BottomSection from "./_components/bottomsection";
import BalanceCard from "./_components/ballancecard";
import { requireAuth } from "@/lib/auth-utils";
export const dynamic = "force-dynamic";
const WalletPage = async () => {
  await requireAuth();
  return (
    <div className="space-y-4">
      <Suspense fallback={<Loading />}>
        <div className="mt-16">
          <BalanceCard />

          <BottomSection />
        </div>
      </Suspense>
    </div>
  );
};

export default WalletPage;
