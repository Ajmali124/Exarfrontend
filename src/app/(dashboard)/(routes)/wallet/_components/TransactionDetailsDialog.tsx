"use client";

import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { ArrowUpRight, DollarSign, ArrowDownLeftSquare } from "lucide-react";
import { UserTransactionss } from "./columns";
import { format } from "date-fns";
import { useThemeClasses } from "@/lib/theme-utils";

interface TransactionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRow: UserTransactionss | null;
}

const TransactionDetailsDialog: React.FC<TransactionDetailsDialogProps> = ({
  isOpen,
  onClose,
  selectedRow,
}) => {
  const { card, text } = useThemeClasses();
  const renderTransactionIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "WITHDRAW":
        return <ArrowUpRight className="text-red-400 w-10 h-10" />;
      case "DEPOSIT":
        return <DollarSign className="text-green-400 w-10 h-10" />;
      default:
        return <ArrowDownLeftSquare className="text-cyan-400 w-10 h-10" />;
    }
  };

  const renderIconGradient = (type: string) => {
    switch (type.toUpperCase()) {
      case "WITHDRAW":
        return "from-red-500/30 via-transparent to-transparent";
      case "DEPOSIT":
        return "from-green-500/30 via-transparent to-transparent";
      default:
        return "from-cyan-500/30 via-transparent to-transparent";
    }
  };

  const formattedDate = selectedRow
    ? format(new Date(selectedRow.createdAt), "PPP • p")
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 sm:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`rounded-xl border p-4 sm:p-5 ${card} shadow-2xl`}>
              {selectedRow && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                    className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b ${renderIconGradient(
                    selectedRow.type
                    )}`}
                >
                  {renderTransactionIcon(selectedRow.type)}
                  </motion.div>
                  <DialogHeader className="text-center mt-2 space-y-1">
                    <DialogTitle className={`text-lg font-semibold tracking-wide ${text.primary}`}>
                      {selectedRow.type.charAt(0).toUpperCase() +
                        selectedRow.type.slice(1).toLowerCase()}{" "}
                      Details
                    </DialogTitle>
                    <p className={`text-xs ${text.secondary}`}>{formattedDate}</p>
                  </DialogHeader>
                </div>

                <DetailBlock
                  label="Amount"
                  value={`${selectedRow.amount.toFixed(2)} ${selectedRow.currency}`}
                  delay={0.15}
                />
                <DetailBlock label="Status" value={selectedRow.status ?? "Unknown"} delay={0.2} />
                <DetailBlock label="Record ID" value={selectedRow.id} delay={0.25} isMonospace />
                {selectedRow.description && (
                  <DetailBlock label="Description" value={selectedRow.description} delay={0.3} />
                )}
                {selectedRow.transactionHash && (
                  <DetailBlock
                    label="Transaction Hash"
                    value={selectedRow.transactionHash}
                    delay={0.35}
                    isMonospace
                  />
                )}
                {selectedRow.fromAddress && (
                  <DetailBlock
                    label="From Address"
                    value={selectedRow.fromAddress}
                    delay={0.4}
                    isMonospace
                  />
                )}
                {selectedRow.toAddress && (
                  <DetailBlock
                    label="To Address"
                    value={selectedRow.toAddress}
                    delay={0.45}
                    isMonospace
                  />
              )}
            </div>
            )}
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

interface DetailBlockProps {
  label: string;
  value: string;
  delay?: number;
  isMonospace?: boolean;
}

const DetailBlock: React.FC<DetailBlockProps> = ({
  label,
  value,
  delay = 0.1,
  isMonospace = false,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.25 }}
    className="bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 p-3 rounded-lg"
  >
    <p className="text-xs font-medium text-teal-300 tracking-wide uppercase">{label}</p>
    <p className={`mt-1 text-sm font-semibold ${isMonospace ? "font-mono break-all" : "text-white"}`}>
      {value}
    </p>
  </motion.div>
);

export default TransactionDetailsDialog;
