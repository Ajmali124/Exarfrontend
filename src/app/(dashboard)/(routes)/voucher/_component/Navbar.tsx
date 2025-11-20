"use client";
import { ChevronLeft, HelpCircle, History, Plus, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavigationProps {
  title: string; // Define the prop for dynamic text
}

const Navigation: React.FC<NavigationProps> = ({ title }) => {
  const router = useRouter();
  
  const goBack = () => {
    window.history.back();
  };

  const handleAddCode = () => {
    router.push("/voucher/add-code");
  };

  return (
    <div className="flex flex-row items-center justify-between p-2 pt-4 bg-white dark:bg-transparent border-b border-gray-100 dark:border-transparent">
      {/* Back Button */}
      <button 
        onClick={goBack}
        className="flex items-center justify-center w-8 h-8 bg-white dark:bg-transparent rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-900 dark:text-gray-100" />
      </button>

      {/* Title */}
      <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h1>

      {/* Right Side Icons */}
      <div className="flex items-center space-x-2">
        {/* Help Icon */}
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <HelpCircle className="w-4 h-4 text-gray-900 dark:text-gray-100" />
        </button>
        <button 
          onClick={handleAddCode}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <Plus className="w-4 h-4 text-gray-900 dark:text-gray-100" />
        </button>
      </div>
    </div>
  );
};

export default Navigation;
