const PublicPromotionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 md:px-6 py-12 space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Promotion
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
            The previous promotion has ended. A new promotion experience is being designed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicPromotionPage;

