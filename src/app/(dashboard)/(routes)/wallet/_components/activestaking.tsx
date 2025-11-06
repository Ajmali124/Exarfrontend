// import getActiveStakingEntries from "@/app/agetdata/getActiveStakingEntries";
import { Card } from "@/components/ui/card";

interface StakingEntry {
  id: string;
  amount: number;
  earned: number;
  maxearn: number;
}

const ActiveStakingEntries = async () => {
  let stakingEntries: StakingEntry[] = [];

  // try {
  //   stakingEntries = await getActiveStakingEntries();
  // } catch (error) {
  //   console.error("Error fetching staking entries:", error);
  //   return <div>Error fetching staking entries.</div>;
  // }

  if (stakingEntries.length === 0) {
    return <div>No active staking entries found.</div>;
  }

  return (
    <Card className="w-full">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Active Staking Transactions
        </h2>
        {stakingEntries.map((entry) => {
          const progress =
            (entry.earned / entry.maxearn) * 100 > 100
              ? 100
              : (entry.earned / entry.maxearn) * 100;

          return (
            <div key={entry.id} className="mb-6">
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="h-4 rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? "#14b8a6" : "#2dd4bf",
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-300  mt-1">
                <span>Staking: {entry.amount.toFixed(0)} ORA</span>
                <span>Reward: {entry.maxearn.toFixed(0)} ORA</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActiveStakingEntries;
