"use client";

import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion"; // For adding animation
import {
  ArrowUpRight,
  DollarSign,
  Download,
  Gift,
  Send,
  Star,
} from "lucide-react"; // Icons to represent transaction types

type Transaction = {
  type: string;
  amount: number;
  status: string;
  date: string;
  walletaddress: string;
};

interface TransactionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRow: Transaction | null;
}

const TransactionDetailsDialog: React.FC<TransactionDetailsDialogProps> = ({
  isOpen,
  onClose,
  selectedRow,
}) => {
  const walletTransactionTypes = [
    "WITHDRAW",
    "DEPOSIT",
    "TRANSFEROUT",
    "TRANSFERIN",
  ];

  // Function to determine which icon to display based on the transaction type
  const renderTransactionIcon = (type: string) => {
    switch (type) {
      case "WITHDRAW":
        return <ArrowUpRight className="text-red-500 w-10 h-10" />;
      case "DEPOSIT":
        return <DollarSign className="text-green-500 w-10 h-10" />;
      case "TRANSFEROUT":
        return <Send className="text-yellow-500 w-10 h-10" />;
      case "TRANSFERIN":
        return <Download className="text-blue-500 w-10 h-10" />;
      case "DirectReward":
        return <Gift className="text-purple-500 w-10 h-10" />;
      case "TeamEarning":
        return <Star className="text-teal-500 w-10 h-10" />;
      default:
        return <DollarSign className="text-gray-500 w-10 h-10" />;
    }
  };

  const renderIconGradient = (type: string) => {
    switch (type) {
      case "WITHDRAW":
        return "from-red-500/20 via-red-500/10 to-transparent";
      case "DEPOSIT":
        return "from-green-500/20 via-green-500/10 to-transparent";
      case "TRANSFEROUT":
        return "from-yellow-500/20 via-yellow-500/10 to-transparent";
      case "TRANSFERIN":
        return "from-blue-500/20 via-blue-500/10 to-transparent";
      case "DirectReward":
        return "from-purple-500/20 via-purple-500/10 to-transparent";
      case "TeamEarning":
        return "from-teal-500/20 via-teal-500/10 to-transparent";
      default:
        return "from-gray-500/20 via-gray-500/10 to-transparent";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6 bg-transparent text-white border-none rounded-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-b from-gray-900 to-gray-800 p-4 rounded-lg">
            <div className="flex flex-col items-center">
              {/* Animated Icon */}
              {/* Circular Gradient behind Icon */}
              {selectedRow && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className={`relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-t ${renderIconGradient(
                    selectedRow.type
                  )} mb-2`}
                >
                  {renderTransactionIcon(selectedRow.type)}
                </motion.div>
              )}

              <DialogHeader className="text-center mt-4">
                <DialogTitle className="text-lg font-semibold tracking-wide text-gray-300">
                  Transaction Details
                </DialogTitle>
              </DialogHeader>

              {/* Transaction Information */}
              {selectedRow && (
                <div className="mt-4 w-full">
                  {/* Info Block */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className=" bg-gray-800 p-2 rounded-lg mb-2"
                  >
                    <p className="text-sm font-medium text-teal-400">Type</p>
                    <p className="text-md font-semibold">{selectedRow.type}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.3 }}
                    className="bg-gray-800 p-2 rounded-lg mb-2"
                  >
                    <p className="text-sm font-medium text-teal-400">Amount</p>
                    <p className="text-md font-semibold">
                      {selectedRow.type === "WITHDRAW"
                        ? `$${selectedRow.amount.toFixed(2)}` // Always show 2 decimal places
                        : `${selectedRow.amount.toFixed(2)} ORA`}{" "}
                      {/* Always show 2 decimal places */}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="bg-gray-800 p-2 rounded-lg mb-2"
                  >
                    <p className="text-sm font-medium text-teal-400">Status</p>
                    <p className="text-md font-semibold">
                      {selectedRow.status}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                    className="bg-gray-800 p-2 rounded-lg mb-2"
                  >
                    <p className="text-sm font-medium text-teal-400">Date</p>
                    <p className="text-md font-semibold">{selectedRow.date}</p>
                  </motion.div>

                  {/* Conditionally show the wallet address */}
                  {walletTransactionTypes.includes(selectedRow.type) && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="bg-gray-800 p-2 rounded-lg mb-2"
                    >
                      <p className="text-sm font-medium text-teal-400">
                        Wallet Address
                      </p>
                      <p className="text-sm font-semibold">
                        {selectedRow.walletaddress}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsDialog;
