"use client";

import { motion } from "framer-motion"; // Import Framer Motion
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaMedal } from "react-icons/fa"; // Import eye and rank icons
import { FiPackage } from "react-icons/fi"; // Import package icon
import { useThemeClasses } from "@/lib/theme-utils";

const WalletCard = () => {
  const [formattedBalance, setFormattedBalance] = useState("0.00");
  const [balanceInOra, setBalanceInOra] = useState("0.00");
  const [status, setStatus] = useState("inactive");
  const [activePackage, setActivePackage] = useState("No Package");
  const [showBalance, setShowBalance] = useState(true); // State for toggling balance visibility
  const { text } = useThemeClasses();

  // Fetch data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // const { balanceInOra, status, activePackage, formattedBalance } =
        //   await getPackage();
        setFormattedBalance(formattedBalance.toString());
        setBalanceInOra(balanceInOra);
        setStatus(status);
        setActivePackage(activePackage);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const toggleBalance = () => {
    setShowBalance((prevState) => !prevState); // Toggle balance visibility
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="p-4 bg-transparent ">
        <div className="flex items-center justify-between">
          {/* Balance Section */}
          <div className="flex flex-col space-y-2">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center space-x-2">
                <h1 className="text-green-600 dark:text-purple-400 font-bold text-xl">Available Assets</h1>
                <button
                  onClick={toggleBalance}
                  className={`${text.primary} focus:outline-none`}
                >
                  {showBalance ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
              <div className="mt-1">
                <h2 className={`${text.primary} text-2xl font-extrabold`}>
                  {showBalance ? formattedBalance : "*****"} ORA
                </h2>
                <p className={text.secondary + " text-sm"}>
                  ≈ {showBalance ? balanceInOra : "*****"} USDT
                </p>
              </div>
            </motion.div>
          </div>

          {/* Rank Icon */}
          <div className="flex flex-col items-center justify-center mr-2">
            <FaMedal className="text-yellow-500 dark:text-yellow-400" size={50} />
          </div>
        </div>

        {/* Subtle Status Section */}
        <motion.div
          className="flex items-center justify-between mt-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${
                status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <p
              className={`text-sm font-semibold ${
                status === "active" ? "text-green-500" : "text-red-500"
              }`}
            >
              {status === "active" ? "Active" : "Inactive"}
            </p>
          </div>

          {/* Attractive Package Name */}
          <div className="flex items-center space-x-2">
            <FiPackage className="text-green-600 dark:text-purple-400" size={16} />{" "}
            {/* Package Icon */}
            <p className="text-white text-sm font-semibold bg-gradient-to-r from-green-500 to-teal-500 dark:from-purple-600 dark:to-purple-700 px-3 py-1 rounded-full shadow-lg">
              {activePackage}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WalletCard;
