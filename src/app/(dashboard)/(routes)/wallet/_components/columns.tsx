"use client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns"; // Importing date-fns for consistent date formatting
import {
  ArrowDownLeftSquare,
  ArrowUpSquare,
  DollarSign,
  Download,
  Gift,
  Package,
  Send,
  Star,
} from "lucide-react";
import { FaCoins } from "react-icons/fa";

export type UserTransactionss = {
  id: string;
  userId: string;
  transactionnum: string;
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
    // | "Transfer"
    // | "Package";
  // Enum based on transactiontype
  txid: string;
  walletaddress: string;
  network: string;
  omniShare?: Number;
  walletadresswithdraw?: string;
  date: string;
};

// Define the columns with improved UI
export const columns: ColumnDef<UserTransactionss, unknown>[] = [
  {
    accessorKey: "type",
    header: () => (
      <div className="text-teal-400 font-semibold">Transaction</div>
    ),
    cell: ({ row }) => {
      const transactionType = row.original.type;

      // Format the date to DD/MM/YYYY format
      const formattedDate = format(new Date(row.original.date), "dd/MM/yyyy");

      let Icon = null;

      // Determine the icon for the transaction type
      switch (transactionType) {
        // case "TRANSFERIN":
        //   Icon = Download;
        //   break;
        case "DEPOSIT":
          Icon = DollarSign;
          break;
        // case "TRANSFEROUT":
        //   Icon = Send;
        //   break;
        case "WITHDRAW":
          Icon = ArrowUpSquare;
          break;
        // case "TeamEarning":
        //   Icon = Star;
        //   break;
        // case "DirectReward":
        //   Icon = Gift;
        //   break;
        // case "DailyEarning":
        //   Icon = Star;
        //   break;
        // case "Transfer":
        //   Icon = Star;
        //   break;
        // case "Package":
        //   Icon = Package;
        //   break;
        default:
          Icon = ArrowDownLeftSquare;
          break;
      }

      return (
        <div className="flex items-center space-x-2">
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full">
            {Icon && <Icon className="text-teal-300 w-6 h-6" />}
          </div>

          {/* Transaction details (label and date) */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">
              {getTransactionLabel(transactionType)}
            </span>
            <span className="text-gray-400 font-light text-xs">
              {formattedDate}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => (
      <div className="text-right text-teal-400 font-semibold">Amount</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const transactionType = row.original.type;

      // Standardize decimal places
      let decimalPlaces = 2; // Default decimal places

      if (amount < 1) {
        decimalPlaces = 3; // 3 decimal places for small numbers
      } else if (amount < 10) {
        decimalPlaces = 3; // 3 decimal places for single-digit numbers
      } else if (amount < 100) {
        decimalPlaces = 2; // 2 decimal places for two-digit numbers
      } else if (amount < 1000) {
        decimalPlaces = 1; // 1 decimal place for three-digit numbers
      } else {
        decimalPlaces = 0; // No decimal places for four-digit numbers
      }
      const formattedAmount = amount.toFixed(decimalPlaces);

      // Determine color and sign based on transaction type
      let colorClass = "";
      let sign = "";
      if (
        transactionType === "DEPOSIT" 
        // transactionType === "TRANSFERIN" ||
        // transactionType === "DailyEarning" ||
        // transactionType === "TeamEarning" ||
        // transactionType === "Transfer" ||
        // transactionType === "DirectReward"
      ) {
        colorClass = "text-green-500"; // Green for positive
        sign = "+";
      } else {
        colorClass = "text-gray-300"; // Gray for negative or neutral transactions
        sign = "-";
      }

      return (
        <div
          className={`flex items-end justify-center space-x-2 ${colorClass}`}
        >
          <FaCoins className="text-yellow-400" />
          <span className="text-sm font-semibold items-start">
            {sign}
            {formattedAmount} ORA
          </span>
        </div>
      );
    },
  },
];

// Helper function for transaction type labels
function getTransactionLabel(
  type:
    | "WITHDRAW"
    | "DEPOSIT"
    // | "TRANSFERIN"
    // | "TRANSFEROUT"
    // | "TeamEarning"
    // | "DailyEarning"
    // | "DirectReward"
    // | "Transfer"
    // | "Package"
): string {
  switch (type) {
    case "WITHDRAW":
      return "Withdraw";
    case "DEPOSIT":
      return "Deposit";
    // case "TRANSFERIN":
    //   return "Ora Received";
    // case "TRANSFEROUT":
    //   return "Ora Sent";
    // case "TeamEarning":
    //   return "Team Reward";
    // case "DailyEarning":
    //   return "Daily Reward";
    // case "DirectReward":
    //   return "Direct Reward";
    // case "Transfer":
    //   return "Transfer";
    // case "Package":
    //   return "Package Purchased";
    default:
      return "Transaction";
  }
}
