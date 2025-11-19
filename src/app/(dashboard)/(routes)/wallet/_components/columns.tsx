"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDownLeftSquare, ArrowUpSquare, DollarSign, PiggyBank, Users } from "lucide-react";

export type UserTransactionss = {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description?: string | null;
  transactionHash?: string | null;
  fromAddress?: string | null;
  toAddress?: string | null;
  createdAt: string;
};

export const columns: ColumnDef<UserTransactionss, unknown>[] = [
  {
    accessorKey: "type",
    header: () => <div className="text-teal-400 font-semibold">Activity</div>,
    cell: ({ row }) => {
      const normalizedType = normalizeType(row.original.type, row.original.description);
      const formattedDate = format(new Date(row.original.createdAt), "dd MMM yyyy, HH:mm");

      const Icon = pickIcon(normalizedType);

      return (
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-teal-200">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">
              {getTransactionLabel(normalizedType) ?? "Transaction"}
            </span>
            <span className="text-gray-400 font-light text-xs">{formattedDate}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "meta",
    header: () => <div className="text-right text-teal-400 font-semibold">Amount</div>,
    cell: ({ row }) => {
      const normalizedType = normalizeType(row.original.type, row.original.description);
      const currency = row.original.currency || "USDT";
      const amount = Math.abs(row.original.amount ?? 0);
      const isPositive = isCredit(normalizedType);
      const sign = isPositive ? "+" : "-";
      const decimalPlaces = amount < 1 ? 3 : amount < 100 ? 2 : 0;
      const formattedAmount = amount.toFixed(decimalPlaces);
      return (
        <div
          className={`flex items-center justify-end space-x-2 ${
            isPositive ? "text-green-400" : "text-gray-200"
          }`}
        >
          <span className="text-sm font-semibold">
            {sign}
            {formattedAmount} {currency}
          </span>
        </div>
      );
    },
  },
];

function normalizeType(type?: string | null, description?: string | null): string {
  const base = (type ?? "").toUpperCase();
  const hint = `${base} ${(description ?? "").toUpperCase()}`;

  if (hint.includes("WITHDRAW")) return "WITHDRAW";
  if (hint.includes("DEPOSIT")) return "DEPOSIT";
  if (hint.includes("TEAM") || hint.includes("COMMISSION")) return "TEAM_EARNING";
  if (hint.includes("DAILY") || hint.includes("EARN")) return "DAILY_EARNING";
  if (base) return base;
  return "TRANSACTION";
}

function pickIcon(type: string) {
  switch (type) {
    case "DEPOSIT":
      return DollarSign;
    case "WITHDRAW":
      return ArrowUpSquare;
    case "DAILY_EARNING":
      return PiggyBank;
    case "TEAM_EARNING":
      return Users;
    default:
      return ArrowDownLeftSquare;
  }
}

function isCredit(type: string) {
  return ["DEPOSIT", "DAILY_EARNING", "TEAM_EARNING"].includes(type);
}

function getTransactionLabel(type?: string | null): string {
  switch (type) {
    case "WITHDRAW":
      return "Withdrawal";
    case "DEPOSIT":
      return "Deposit";
    case "DAILY_EARNING":
      return "Daily Yield";
    case "TEAM_EARNING":
      return "Team Commission";
    default:
      return "Transaction";
  }
}

