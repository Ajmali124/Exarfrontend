// BalanceCardSkeleton.tsx
const BalanceCardSkeleton = () => (
  <div className="w-full px-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded ml-2"></div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </div>

      {/* Main Balance Display Skeleton */}
      <div className="mb-4">
        <div className="flex items-baseline">
          <div className="w-32 h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded ml-2"></div>
        </div>
        
        {/* USD Equivalent Skeleton */}
        <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded mt-2"></div>
      </div>

      {/* Today's PnL Skeleton */}
      <div className="flex items-center justify-between">
        <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  </div>
);

export default BalanceCardSkeleton;
