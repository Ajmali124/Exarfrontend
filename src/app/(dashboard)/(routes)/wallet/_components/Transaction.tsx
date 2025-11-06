import prismadb from "@/lib/prismadb";
// import serverAuth from "@/lib/serverAuth";
import { columns } from "./columns";
import { DataTable } from "./data-table";
export type UserTransactionss = {
  id: string;
  userId: string;
  txid: string;
  amount: number;
  fee: number;
  status: "PENDING" | "COMPLETED" | "REJECTED"; // Enum based on transactionstatus
  type:
    | "WITHDRAW"
    | "DEPOSIT"
    // | "TRANSFERIN"
    // | "TRANSFEROUT"
    // | "DailyEarning"
    // | "TeamEarning"
    // | "DirectReward"
    // | "Package"
    // | "Transfer"; // Enum based on transactiontype
  walletaddress: string;
  network: string;
  date: string;
};

// async function getData(): Promise<UserTransactionss[]> {
//   // Fetch data from your API here.
//   // const { currentUser } = await serverAuth();
//   // const userTransactions = await prismadb.userTransaction.findMany({
//   //   where: {
//   //     userId: currentUser.id,
//   //   },
//   // });
//   // const formattedData: UserTransactionss[] = userTransactions.map(
//   //   (transaction) => {
//   //     const formattedDate = transaction.createdAt
//   //       ? transaction.createdAt.toLocaleString()
//   //       : new Date().toLocaleString();

//   //     return {
//   //       id: transaction.id,
//   //       userId: transaction.userId,
//   //       amount: Number(transaction.amount),
//   //       fee: Number(transaction.fee),
//   //       status: transaction.status,
//   //       type: transaction.type,
//   //       txid: transaction.txid,
//   //       walletaddress: transaction.walletaddress,
//   //       network: transaction.network,
//   //       date: formattedDate,
//   //     };
//   //   }
//   // );

//   //  return formattedData;
// }

const WalletData = async () => {
  // const data = await getData();
  // Sort the data by date in descending order
  // const sortedData = data.sort((a, b) => {
  //   const dateA = new Date(a.date);
  //   const dateB = new Date(b.date);
  //   return dateB.getTime() - dateA.getTime();
  // });

  return (
    <div className="bg-transparent shadow-lg rounded-lg border-none  mx-2 mt-4 w-full px-3">
      <div className="flex flex-row justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-white">Transactions</h2>
        <p className="text-sm font-normal text-gray-600">/History</p>
      </div>

      <div className="overflow-x-auto">
        {/* <DataTable columns={columns} data={sortedData} /> */}
      </div>
    </div>
  );
};

export default WalletData;
