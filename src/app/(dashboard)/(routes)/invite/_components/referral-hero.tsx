import { useThemeClasses } from "@/lib/theme-utils";

const ReferralHero = () => {
  const { text, bg } = useThemeClasses();

  return (
    <section className="space-y-4">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-green-600 dark:text-green-400">
        Invite & Earn
      </p>
      <h1 className="text-3xl leading-tight sm:text-4xl sm:leading-tight font-black tracking-tight">
        <span className={text.primary}>Refer Friends{" "}</span>
        <span className="block sm:inline">
          Earn Up to{" "}
          <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
            5% Direct Rewards
          </span>
        </span>
      </h1>
    </section>
  );
};

export default ReferralHero;

