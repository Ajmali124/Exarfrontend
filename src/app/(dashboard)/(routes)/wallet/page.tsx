import { Suspense } from "react";
import Loading from "../../loading";
import BottomSection from "./_components/bottomsection";
import BalanceCard from "./_components/ballancecard";

const WalletPage = () => {
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
