import { requireAuth } from "@/lib/auth-utils";
import { dashboardTheme } from "@/lib/theme-utils";

const PromotionPage = async () => {
  await requireAuth();

  return (
    <div className={`min-h-screen ${dashboardTheme.content.default}`}>
      <div className="mt-14 px-4 md:px-6 py-6 space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 p-5 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Promotion
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            The previous promotion has ended. We’re redesigning a new promotion page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromotionPage;