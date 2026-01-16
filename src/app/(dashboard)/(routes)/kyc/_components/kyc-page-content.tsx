"use client";

import { KycSection } from "../../profile/_components/kyc-section";
import { useThemeClasses } from "@/lib/theme-utils";

const KycPageContent = () => {
  const { bg, text } = useThemeClasses();
  return (
    <div className={`min-h-screen px-4 pb-16 pt-16 sm:px-6 ${bg.primary}`}>
      <div className="mx-auto w-full max-w-xl space-y-6">
        {/* Hero (match Invite vibe) */}
        <section className="space-y-4">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-green-600 dark:text-green-400">
            Verification
          </p>
          <h1 className="text-3xl leading-tight sm:text-4xl sm:leading-tight font-black tracking-tight">
            <span className={text.primary}>Complete your</span>{" "}
            <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
              KYC
            </span>
          </h1>
          <p className={`${text.secondary} text-sm`}>
            Basic + Advanced verification.
          </p>
        </section>

        <KycSection />
      </div>
    </div>
  );
};

export default KycPageContent;

