"use client";
// import { getUserData } from "@/action/Userdata";
// import { getPrice } from "@/app/agetdata/getprice";
import { useEffect, useState } from "react";
import { FaWallet, FaEye, FaChevronDown, FaChartLine, FaClock } from "react-icons/fa";
import BalanceCardSkeleton from "./Ballancecardskeleton";


// UserData interface
interface UserData {
  name: string | null;
  email: string | null;
  totalBalance: number;
  image: string | null;
  createat: Date;
  code: string | null;
}

const BalanceCard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'SOL' | 'USDT'>('SOL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const userDataResponse = await getUserData();
        const userDataResponse = 0;
        // setUserData(userDataResponse);
      } catch (error) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <BalanceCardSkeleton />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <div>No user data available</div>;
  }

  const formattedBalance = userData.totalBalance || 0;
  
  // Convert balance based on selected currency (mock conversion rates)
  const conversionRates = {
    SOL: 1, // Base currency
    USDT: 150 // Mock rate: 1 SOL = 150 USDT
  };
  
  const displayBalance = formattedBalance * conversionRates[selectedCurrency];
  const usdEquivalent = formattedBalance * conversionRates.USDT;

  return (
    <div className="w-full px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        {/* Header with Total Assets and Eye Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Assets</span>
            <FaEye 
              className="ml-2 text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setBalanceVisible(!balanceVisible)}
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center">
              <FaChartLine className="text-blue-500 text-sm" />
            </div>
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center">
              <FaClock className="text-gray-600 dark:text-gray-400 text-sm" />
            </div>
          </div>
        </div>

        {/* Main Balance Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline">
              <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                {balanceVisible ? displayBalance.toFixed(2) : '••••••'}
              </span>
              <div className="relative ml-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {selectedCurrency}
                  <FaChevronDown className="ml-1 text-xs" />
                </button>
                
                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[80px]">
                    <button
                      onClick={() => {
                        setSelectedCurrency('SOL');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg"
                    >
                      SOL
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCurrency('USDT');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 last:rounded-b-lg"
                    >
                      USDT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* USD Equivalent */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ≈ ${usdEquivalent.toFixed(2)}
          </div>
        </div>

        {/* Today's PnL */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Today's PnL</span>
          <div className="flex items-center">
            <span className="text-sm font-medium text-green-500">$0.00 (+0.00%)</span>
            <FaChevronDown className="ml-1 text-xs text-gray-500 rotate-[-90deg]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
