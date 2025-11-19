import { Card } from "@/components/ui/card";
import ActiveStakingEntries from "./activestaking";
import WalletData from "./Transaction";
import WalletNav from "./wallenav";
import ActiveStakesSummary from "../../stake/_components/ActiveStakesSummary";

const BottomSection = () => {
  return (
    <Card className="flex flex-col items-center justify-between  bg-transparent rounded-t-3xl border-none mt-6 pt-4 shadow-lg ">
      <WalletNav />
      <WalletData />
    </Card>
  );
};

export default BottomSection;
