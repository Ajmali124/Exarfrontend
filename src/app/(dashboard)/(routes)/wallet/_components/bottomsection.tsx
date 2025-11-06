import { Card } from "@/components/ui/card";
import ActiveStakingEntries from "./activestaking";
import WalletData from "./Transaction";
import WalletNav from "./wallenav";

const BottomSection = () => {
  return (
    <Card className="flex flex-col items-center justify-between  bg-transparent rounded-t-3xl border-none mt-6 pt-4 shadow-lg ">
      <WalletNav />
      <hr className="my-2 border-t border-gray-500" />
      <div className="p-4 w-full">
        <ActiveStakingEntries />
      </div>
      <WalletData />
    </Card>
  );
};

export default BottomSection;
